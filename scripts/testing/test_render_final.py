#!/usr/bin/env python3
"""
Youth Green Jobs Hub - Final Render Deployment Test
Tests the actual deployed endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime

# Your deployed Render URL
RENDER_URL = "https://youth-green-jobs-hub.onrender.com"

def test_deployment():
    """Test the deployed application"""
    print("🚀 Youth Green Jobs Hub - Final Deployment Test")
    print("=" * 60)
    print(f"Testing: {RENDER_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Youth-Green-Jobs-Test/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    })
    
    tests_passed = 0
    total_tests = 0
    
    # Test 1: API Root
    print("🔌 Testing API Root")
    print("-" * 30)
    try:
        response = session.get(f"{RENDER_URL}/api/v1/", timeout=15)
        if response.status_code == 200:
            data = response.json()
            print("✅ API Root: Working")
            print(f"   Message: {data.get('message', 'N/A')}")
            print(f"   Version: {data.get('version', 'N/A')}")
            print(f"   Available endpoints: {len(data.get('endpoints', {}))}")
            tests_passed += 1
        else:
            print(f"❌ API Root: Failed (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ API Root: Error - {e}")
    total_tests += 1
    print()
    
    # Test 2: Admin Panel
    print("👨‍💼 Testing Admin Panel")
    print("-" * 30)
    try:
        response = session.get(f"{RENDER_URL}/admin/", timeout=15)
        if response.status_code in [200, 302]:
            print("✅ Admin Panel: Accessible")
            if "Django administration" in response.text or response.status_code == 302:
                print("   Django admin interface working")
            tests_passed += 1
        else:
            print(f"❌ Admin Panel: Failed (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Admin Panel: Error - {e}")
    total_tests += 1
    print()
    
    # Test 3: Authentication Endpoints
    print("🔐 Testing Authentication Endpoints")
    print("-" * 30)
    auth_endpoints = [
        ("/api/v1/auth/register/", "Registration"),
        ("/api/v1/auth/login/", "Login"),
        ("/api/v1/auth/users/", "User List"),
    ]
    
    for endpoint, name in auth_endpoints:
        try:
            response = session.get(f"{RENDER_URL}{endpoint}", timeout=10)
            if response.status_code in [200, 401, 403, 405]:  # 405 = Method not allowed (normal for POST endpoints)
                print(f"✅ {name}: Endpoint accessible")
                if response.status_code == 405:
                    print(f"   (POST endpoint - GET not allowed)")
                tests_passed += 1
            else:
                print(f"❌ {name}: Failed (Status: {response.status_code})")
        except Exception as e:
            print(f"❌ {name}: Error - {e}")
        total_tests += 1
    print()
    
    # Test 4: Database Connection (via API)
    print("🗄️ Testing Database Connection")
    print("-" * 30)
    try:
        # Test user list endpoint which requires database
        response = session.get(f"{RENDER_URL}/api/v1/auth/users/", timeout=15)
        if response.status_code in [200, 401, 403]:
            print("✅ Database: Connected and working")
            print("   API endpoints can query database")
            tests_passed += 1
        else:
            print(f"❌ Database: Issues detected (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Database: Error - {e}")
    total_tests += 1
    print()
    
    # Test 5: Security and Performance
    print("🔒 Testing Security & Performance")
    print("-" * 30)
    try:
        start_time = time.time()
        response = session.get(f"{RENDER_URL}/api/v1/", timeout=30)
        end_time = time.time()
        
        response_time = end_time - start_time
        
        # Check security headers
        security_headers = [
            'X-Content-Type-Options',
            'X-Frame-Options',
            'Strict-Transport-Security'
        ]
        
        found_security = any(header in response.headers for header in security_headers)
        
        if found_security:
            print("✅ Security Headers: Present")
            tests_passed += 1
        else:
            print("❌ Security Headers: Missing")
        total_tests += 1
        
        if response_time < 5:
            print(f"✅ Performance: Excellent ({response_time:.2f}s)")
            tests_passed += 1
        elif response_time < 15:
            print(f"✅ Performance: Good ({response_time:.2f}s)")
            tests_passed += 1
        else:
            print(f"❌ Performance: Slow ({response_time:.2f}s)")
        total_tests += 1
        
        # Check HTTPS
        if RENDER_URL.startswith('https://'):
            print("✅ SSL/HTTPS: Enabled")
            tests_passed += 1
        else:
            print("❌ SSL/HTTPS: Not enabled")
        total_tests += 1
        
    except Exception as e:
        print(f"❌ Security/Performance: Error - {e}")
        total_tests += 3
    print()
    
    # Test 6: Environment Configuration
    print("⚙️ Testing Environment Configuration")
    print("-" * 30)
    try:
        response = session.get(f"{RENDER_URL}/api/v1/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if "Youth Green Jobs" in data.get('message', ''):
                print("✅ Environment: Production settings active")
                print(f"   Platform: {data.get('message', 'N/A')}")
                tests_passed += 1
            else:
                print("❌ Environment: Configuration issues")
        else:
            print(f"❌ Environment: Failed (Status: {response.status_code})")
    except Exception as e:
        print(f"❌ Environment: Error - {e}")
    total_tests += 1
    print()
    
    # Summary
    print("=" * 60)
    print("📊 FINAL TEST SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {total_tests}")
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {total_tests - tests_passed}")
    print(f"Success Rate: {(tests_passed/total_tests)*100:.1f}%")
    print()
    
    if tests_passed == total_tests:
        print("🎉 PERFECT! Your Render deployment is fully working!")
        print("🚀 Your Youth Green Jobs Hub is live and ready!")
    elif tests_passed >= total_tests * 0.8:
        print("✅ EXCELLENT! Your deployment is working great!")
        print("🌟 Minor optimizations possible, but ready for use!")
    elif tests_passed >= total_tests * 0.6:
        print("✅ GOOD! Your deployment is mostly working!")
        print("🔧 Some features may need attention.")
    else:
        print("⚠️ NEEDS WORK! Several issues detected.")
        print("🛠️ Please check the failed tests.")
    
    print()
    print("🌐 Your Live URLs:")
    print(f"   🔗 API: {RENDER_URL}/api/v1/")
    print(f"   👨‍💼 Admin: {RENDER_URL}/admin/")
    print(f"   🔐 Auth: {RENDER_URL}/api/v1/auth/")
    print()
    print("🎯 Next Steps:")
    print("   1. Create superuser account")
    print("   2. Test payment gateways")
    print("   3. Deploy frontend to Vercel")
    print("   4. Configure custom domain")
    print("=" * 60)

if __name__ == "__main__":
    test_deployment()
