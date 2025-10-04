#!/usr/bin/env python3
"""
Direct script to populate production database via API calls to Django admin
"""
import requests
import time
from requests.auth import HTTPBasicAuth

def login_to_admin():
    """Login to Django admin and get session"""
    session = requests.Session()
    
    # Get login page to get CSRF token
    login_url = "https://youth-green-jobs-hub.onrender.com/admin/login/"
    response = session.get(login_url)
    
    if response.status_code != 200:
        print(f"❌ Cannot access admin login page: {response.status_code}")
        return None
    
    # Extract CSRF token
    csrf_token = None
    if 'csrfmiddlewaretoken' in response.text:
        import re
        match = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', response.text)
        if match:
            csrf_token = match.group(1)
    
    if not csrf_token:
        print("❌ Could not find CSRF token")
        return None
    
    # Login
    login_data = {
        'username': 'admin',
        'password': 'YouthGreenJobs2024!',
        'csrfmiddlewaretoken': csrf_token,
        'next': '/admin/'
    }
    
    response = session.post(login_url, data=login_data)
    
    if response.status_code == 302 and '/admin/' in response.headers.get('Location', ''):
        print("✅ Successfully logged into Django admin")
        return session
    else:
        print("❌ Login failed")
        return None

def trigger_populate_via_admin_action(session):
    """Trigger the populate action via Django admin"""
    try:
        # Get the product categories admin page
        categories_url = "https://youth-green-jobs-hub.onrender.com/admin/products/productcategory/"
        response = session.get(categories_url)
        
        if response.status_code != 200:
            print(f"❌ Cannot access categories admin: {response.status_code}")
            return False
        
        # Extract CSRF token from the page
        csrf_token = None
        if 'csrfmiddlewaretoken' in response.text:
            import re
            match = re.search(r'name="csrfmiddlewaretoken" value="([^"]+)"', response.text)
            if match:
                csrf_token = match.group(1)
        
        if not csrf_token:
            print("❌ Could not find CSRF token on admin page")
            return False
        
        # Trigger the populate action
        action_data = {
            'action': 'populate_sample_data',
            'csrfmiddlewaretoken': csrf_token,
            '_selected_action': [],  # No items need to be selected for this action
        }
        
        response = session.post(categories_url, data=action_data)
        
        if response.status_code == 200 or response.status_code == 302:
            print("✅ Populate action triggered successfully")
            return True
        else:
            print(f"❌ Populate action failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error triggering populate action: {e}")
        return False

def verify_population():
    """Verify that the database has been populated"""
    endpoints = {
        'products': '/api/v1/products/products/',
        'categories': '/api/v1/products/categories/',
        'vendors': '/api/v1/products/vendors/'
    }
    
    print("\n📊 Verifying Database Population:")
    total_items = 0
    
    for name, endpoint in endpoints.items():
        try:
            response = requests.get(f"https://youth-green-jobs-hub.onrender.com{endpoint}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                count = data.get('count', 0)
                total_items += count
                status = "✅" if count > 0 else "⚠️"
                print(f"   {status} {name.capitalize()}: {count}")
            else:
                print(f"   ❌ {name.capitalize()}: Error {response.status_code}")
        except Exception as e:
            print(f"   ❌ {name.capitalize()}: Error - {e}")
    
    return total_items > 0

def main():
    print("🚀 Direct Production Database Population")
    print("=" * 45)
    
    # Login to admin
    session = login_to_admin()
    if not session:
        print("❌ Cannot proceed without admin session")
        return
    
    # Trigger populate action
    print("\n🌱 Triggering database population...")
    success = trigger_populate_via_admin_action(session)
    
    if success:
        print("⏰ Waiting for population to complete...")
        time.sleep(10)  # Wait for the action to complete
        
        # Verify population
        if verify_population():
            print("\n🎉 SUCCESS! Database has been populated!")
            print("\n✅ Next Steps:")
            print("   1. Check frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products")
            print("   2. You should now see products displayed!")
            print("   3. Test browsing, searching, and product details")
        else:
            print("\n⚠️ Population may not have completed yet")
            print("   Wait a few more minutes and check the frontend")
    else:
        print("\n❌ Failed to trigger population")
        print("   You may need to do it manually via Django admin")

if __name__ == "__main__":
    main()
