#!/usr/bin/env python3
"""
Comprehensive Integration Test Suite for Youth Green Jobs Hub
Tests full-stack functionality including API endpoints, authentication, and data flow
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://localhost:5174"

class IntegrationTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.refresh_token = None
        self.test_user_id = None
        
    def log(self, message, status="INFO"):
        timestamp = datetime.now().strftime("%H:%M:%S")
        print(f"[{timestamp}] {status}: {message}")
        
    def test_api_root(self):
        """Test API root endpoint"""
        self.log("Testing API root endpoint...")
        try:
            response = self.session.get(f"{BASE_URL}/api/v1/")
            if response.status_code == 200:
                data = response.json()
                self.log(f"✅ API Root: {data['message']}", "SUCCESS")
                self.log(f"   Version: {data['version']}")
                self.log(f"   Available endpoints: {len(data['endpoints'])}")
                return True
            else:
                self.log(f"❌ API Root failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ API Root error: {str(e)}", "ERROR")
            return False
            
    def test_user_registration(self):
        """Test user registration"""
        self.log("Testing user registration...")
        try:
            user_data = {
                "username": f"testuser_{int(time.time())}",
                "email": f"test_{int(time.time())}@example.com",
                "password": "TestPassword123!",
                "password_confirm": "TestPassword123!",
                "first_name": "Integration",
                "last_name": "Test"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/v1/auth/register/",
                json=user_data
            )
            
            if response.status_code == 201:
                data = response.json()
                self.access_token = data['tokens']['access']
                self.refresh_token = data['tokens']['refresh']
                self.test_user_id = data['user']['id']
                self.session.headers.update({
                    'Authorization': f'Bearer {self.access_token}'
                })
                self.log(f"✅ User registered: {data['user']['username']}", "SUCCESS")
                self.log(f"   Profile completion: {data['user']['profile_completion_percentage']}%")
                return True
            else:
                self.log(f"❌ Registration failed: {response.status_code} - {response.text}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Registration error: {str(e)}", "ERROR")
            return False
            
    def test_authentication(self):
        """Test JWT authentication"""
        self.log("Testing JWT authentication...")
        try:
            # Test protected endpoint
            response = self.session.get(f"{BASE_URL}/api/v1/waste/categories/")
            if response.status_code == 200:
                self.log("✅ JWT authentication working", "SUCCESS")
                return True
            else:
                self.log(f"❌ Authentication failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Authentication error: {str(e)}", "ERROR")
            return False
            
    def test_waste_endpoints(self):
        """Test waste management endpoints"""
        self.log("Testing waste management endpoints...")
        try:
            # Test categories
            response = self.session.get(f"{BASE_URL}/api/v1/waste/categories/")
            if response.status_code == 200:
                categories = response.json()
                self.log(f"✅ Waste categories: {categories['count']} found", "SUCCESS")
                
                # Test collection points
                response = self.session.get(f"{BASE_URL}/api/v1/waste/collection-points/")
                if response.status_code == 200:
                    points = response.json()
                    self.log(f"✅ Collection points: {points['count']} found", "SUCCESS")
                    return True
                    
            self.log(f"❌ Waste endpoints failed: {response.status_code}", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ Waste endpoints error: {str(e)}", "ERROR")
            return False
            
    def test_products_endpoints(self):
        """Test products marketplace endpoints"""
        self.log("Testing products marketplace endpoints...")
        try:
            # Test product categories
            response = self.session.get(f"{BASE_URL}/api/v1/products/categories/")
            if response.status_code == 200:
                categories = response.json()
                self.log(f"✅ Product categories: {categories['count']} found", "SUCCESS")
                
                # Test products
                response = self.session.get(f"{BASE_URL}/api/v1/products/")
                if response.status_code == 200:
                    products = response.json()
                    self.log(f"✅ Products: {products['count']} found", "SUCCESS")
                    return True
                    
            self.log(f"❌ Products endpoints failed: {response.status_code}", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ Products endpoints error: {str(e)}", "ERROR")
            return False
            
    def test_frontend_connectivity(self):
        """Test frontend server connectivity"""
        self.log("Testing frontend server connectivity...")
        try:
            response = requests.get(FRONTEND_URL, timeout=5)
            if response.status_code == 200:
                self.log("✅ Frontend server accessible", "SUCCESS")
                return True
            else:
                self.log(f"❌ Frontend server failed: {response.status_code}", "ERROR")
                return False
        except Exception as e:
            self.log(f"❌ Frontend connectivity error: {str(e)}", "ERROR")
            return False
            
    def test_database_connectivity(self):
        """Test database operations through API"""
        self.log("Testing database connectivity...")
        try:
            # Test user profile update (database write)
            profile_data = {
                "bio": "Integration test user profile",
                "county": "Kisumu",
                "skills": "Testing, Integration, Quality Assurance"
            }
            
            response = self.session.patch(
                f"{BASE_URL}/api/v1/auth/profile/",
                json=profile_data
            )
            
            if response.status_code == 200:
                self.log("✅ Database write operations working", "SUCCESS")
                
                # Test read operation
                response = self.session.get(f"{BASE_URL}/api/v1/auth/profile/")
                if response.status_code == 200:
                    profile = response.json()
                    self.log(f"✅ Database read operations working", "SUCCESS")
                    self.log(f"   Profile completion: {profile.get('profile_completion_percentage', 0)}%")
                    return True
                    
            self.log(f"❌ Database operations failed: {response.status_code}", "ERROR")
            return False
        except Exception as e:
            self.log(f"❌ Database connectivity error: {str(e)}", "ERROR")
            return False
            
    def run_all_tests(self):
        """Run comprehensive integration test suite"""
        self.log("🚀 Starting Comprehensive Integration Test Suite", "INFO")
        self.log("=" * 60)
        
        tests = [
            ("API Root", self.test_api_root),
            ("User Registration", self.test_user_registration),
            ("JWT Authentication", self.test_authentication),
            ("Waste Management", self.test_waste_endpoints),
            ("Products Marketplace", self.test_products_endpoints),
            ("Database Operations", self.test_database_connectivity),
            ("Frontend Connectivity", self.test_frontend_connectivity),
        ]
        
        results = {}
        for test_name, test_func in tests:
            self.log(f"\n🧪 Running: {test_name}")
            results[test_name] = test_func()
            time.sleep(0.5)  # Brief pause between tests
            
        # Summary
        self.log("\n" + "=" * 60)
        self.log("📊 INTEGRATION TEST RESULTS SUMMARY", "INFO")
        self.log("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            self.log(f"{test_name:<25} {status}")
            
        self.log(f"\n🎯 Overall Result: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 ALL TESTS PASSED - Full-stack integration successful!", "SUCCESS")
        else:
            self.log(f"⚠️  {total - passed} tests failed - Review errors above", "WARNING")
            
        return passed == total

if __name__ == "__main__":
    tester = IntegrationTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)
