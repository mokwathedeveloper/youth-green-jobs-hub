#!/usr/bin/env python3
"""
Youth Green Jobs Hub - Database Fix Script for Render
This script helps you fix the database issues to reach 5/5 status
"""

import requests
import json
import time
from datetime import datetime

RENDER_URL = "https://youth-green-jobs-hub.onrender.com"

def test_user_endpoint():
    """Test the problematic user endpoint"""
    print("🧪 Testing User List Endpoint")
    print("=" * 40)
    
    try:
        response = requests.get(f"{RENDER_URL}/api/v1/auth/users/", timeout=15)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ User endpoint working!")
            try:
                data = response.json()
                print(f"Users found: {len(data.get('results', data))}")
                return True
            except:
                print("✅ Endpoint accessible but no JSON response")
                return True
        elif response.status_code == 401:
            print("✅ Endpoint working (authentication required)")
            return True
        elif response.status_code == 403:
            print("✅ Endpoint working (permission required)")
            return True
        elif response.status_code == 500:
            print("❌ Database error - needs fixing")
            return False
        else:
            print(f"❌ Unexpected status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_user_registration():
    """Test user registration to see if database is working"""
    print("\n👤 Testing User Registration")
    print("=" * 40)
    
    test_user = {
        "username": f"testuser_{int(time.time())}",
        "email": f"test_{int(time.time())}@youthgreenjobs.ke",
        "password": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    try:
        response = requests.post(
            f"{RENDER_URL}/api/v1/auth/register/",
            json=test_user,
            headers={'Content-Type': 'application/json'},
            timeout=20
        )
        
        print(f"Registration Status: {response.status_code}")
        
        if response.status_code == 201:
            print("✅ User registration working!")
            print("✅ Database is functional")
            return True
        elif response.status_code == 400:
            try:
                error_data = response.json()
                print("⚠️ Registration validation error (database working):")
                print(f"   {error_data}")
                return True  # Database is working, just validation issues
            except:
                print("⚠️ Registration error but database accessible")
                return True
        elif response.status_code == 500:
            print("❌ Database error during registration")
            return False
        else:
            print(f"❌ Unexpected registration status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Registration test failed: {e}")
        return False

def provide_render_shell_commands():
    """Provide exact commands to run in Render shell"""
    print("\n🔧 RENDER SHELL COMMANDS TO FIX DATABASE")
    print("=" * 50)
    print("Go to your Render dashboard and follow these steps:")
    print()
    
    print("1. 🌐 Open Render Dashboard:")
    print("   - Go to: https://render.com/dashboard")
    print("   - Click on your service: youth-green-jobs-hub")
    print()
    
    print("2. 🖥️ Open Shell:")
    print("   - Click on 'Shell' tab in your service")
    print("   - Wait for shell to connect")
    print()
    
    print("3. 🗄️ Check Database Connection:")
    print("   python manage.py dbshell --help")
    print("   # This should work if database is connected")
    print()
    
    print("4. 📋 Check Migrations:")
    print("   python manage.py showmigrations")
    print("   # Look for any [ ] (unapplied migrations)")
    print()
    
    print("5. 🚀 Apply Migrations:")
    print("   python manage.py migrate")
    print("   # This creates all database tables")
    print()
    
    print("6. 👨‍💼 Create Superuser:")
    print("   python manage.py createsuperuser")
    print("   # Follow prompts:")
    print("   #   Username: admin")
    print("   #   Email: moffatmokwa12@gmail.com")
    print("   #   Password: (choose secure password)")
    print()
    
    print("7. 🧪 Test Database:")
    print("   python manage.py shell")
    print("   # In Python shell:")
    print("   from django.contrib.auth.models import User")
    print("   print(User.objects.count())")
    print("   exit()")
    print()
    
    print("8. 🔄 Restart Service (if needed):")
    print("   - Go back to service overview")
    print("   - Click 'Manual Deploy' → 'Deploy latest commit'")

def provide_alternative_fix():
    """Provide alternative fix through environment variables"""
    print("\n🔧 ALTERNATIVE FIX: Update Build Script")
    print("=" * 50)
    print("If shell access doesn't work, update your build.sh:")
    print()
    
    print("Current build.sh should include:")
    print("```bash")
    print("#!/usr/bin/env bash")
    print("set -o errexit")
    print()
    print("# Install dependencies")
    print("pip install -r requirements.txt")
    print()
    print("# Collect static files")
    print("python manage.py collectstatic --no-input")
    print()
    print("# Run migrations")
    print("python manage.py migrate")
    print()
    print("# Create superuser if it doesn't exist")
    print("python manage.py shell -c \"")
    print("from django.contrib.auth.models import User;")
    print("if not User.objects.filter(username='admin').exists():")
    print("    User.objects.create_superuser('admin', 'moffatmokwa12@gmail.com', 'YouthGreenJobs2024!')\"")
    print()
    print("# Create PostGIS extension")
    print("python manage.py shell -c \"")
    print("from django.db import connection")
    print("with connection.cursor() as cursor:")
    print("    try:")
    print("        cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis;')")
    print("        print('PostGIS extension created')")
    print("    except Exception as e:")
    print("        print(f'PostGIS error: {e}')\"")
    print("```")

def run_final_test():
    """Run final test to check if we reached 5/5"""
    print("\n🎯 FINAL STATUS CHECK")
    print("=" * 40)
    
    tests = [
        ("API Root", "/api/v1/"),
        ("Admin Panel", "/admin/"),
        ("Registration", "/api/v1/auth/register/"),
        ("Login", "/api/v1/auth/login/"),
        ("User List", "/api/v1/auth/users/"),
    ]
    
    working = 0
    total = len(tests)
    
    for name, endpoint in tests:
        try:
            if endpoint in ["/api/v1/auth/register/", "/api/v1/auth/login/"]:
                # POST endpoints - expect 405 for GET
                response = requests.get(f"{RENDER_URL}{endpoint}", timeout=10)
                success = response.status_code == 405
            elif endpoint == "/api/v1/auth/users/":
                # This is the problematic one
                response = requests.get(f"{RENDER_URL}{endpoint}", timeout=10)
                success = response.status_code in [200, 401, 403]
            else:
                response = requests.get(f"{RENDER_URL}{endpoint}", timeout=10)
                success = response.status_code in [200, 302]
            
            status = "✅" if success else "❌"
            print(f"{status} {name}: {response.status_code}")
            
            if success:
                working += 1
                
        except Exception as e:
            print(f"❌ {name}: Error - {e}")
    
    print(f"\nFinal Status: {working}/{total} ({(working/total)*100:.1f}%)")
    
    if working == total:
        print("🎉 PERFECT! 5/5 - All systems working!")
    elif working == total - 1:
        print("🔧 Almost there! 1 issue remaining")
    else:
        print("🛠️ Multiple issues need fixing")
    
    return working, total

def main():
    """Main function"""
    print("🚀 Youth Green Jobs Hub - Database Fix Guide")
    print("=" * 60)
    print(f"Target: {RENDER_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test current status
    user_endpoint_working = test_user_endpoint()
    registration_working = test_user_registration()
    
    if user_endpoint_working and registration_working:
        print("\n🎉 Database appears to be working!")
        print("Running final test...")
        working, total = run_final_test()
        if working == total:
            print("\n✅ ALL SYSTEMS GO! You've reached 5/5 status!")
            return
    
    # Provide fix instructions
    provide_render_shell_commands()
    provide_alternative_fix()
    
    print("\n" + "=" * 60)
    print("📋 SUMMARY TO REACH 5/5 STATUS:")
    print("=" * 60)
    print("1. Use Render Shell to run database migrations")
    print("2. Create superuser account")
    print("3. Test endpoints again")
    print("4. If still issues, update build.sh script")
    print("5. Redeploy service")
    print()
    print("After following these steps, run:")
    print("python test_render_final.py")
    print()
    print("🎯 Goal: 5/5 tests passing (100% success rate)")
    print("=" * 60)

if __name__ == "__main__":
    main()
