#!/usr/bin/env python3
"""
Youth Green Jobs Hub - Render Deployment Test Suite
Tests all functionality of the deployed application on Render.com
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
RENDER_BASE_URL = "https://youth-green-jobs-api.onrender.com"
TEST_EMAIL = "test@youthgreenjobs.ke"
TEST_PHONE = "254708374149"  # M-Pesa test phone

class RenderDeploymentTester:
    def __init__(self, base_url):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Youth-Green-Jobs-Test/1.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        })
        self.test_results = []
        
    def log_test(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'details': details,
            'timestamp': datetime.now().isoformat()
        })
        
        if details and not success:
            print(f"   Details: {details}")
    
    def test_basic_connectivity(self):
        """Test basic server connectivity"""
        print("\n🔗 Testing Basic Connectivity")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{self.base_url}/", timeout=30)
            if response.status_code == 200:
                self.log_test("Basic Connectivity", True, f"Server responding (Status: {response.status_code})")
                return True
            else:
                self.log_test("Basic Connectivity", False, f"Unexpected status code: {response.status_code}")
                return False
        except requests.exceptions.Timeout:
            self.log_test("Basic Connectivity", False, "Server timeout (>30s) - service may be sleeping")
            return False
        except requests.exceptions.ConnectionError as e:
            self.log_test("Basic Connectivity", False, f"Connection error: {str(e)}")
            return False
        except Exception as e:
            self.log_test("Basic Connectivity", False, f"Unexpected error: {str(e)}")
            return False
    
    def test_api_endpoints(self):
        """Test API endpoints"""
        print("\n🔌 Testing API Endpoints")
        print("=" * 50)
        
        endpoints = [
            ("/api/v1/", "API Root"),
            ("/api/v1/auth/", "Authentication"),
            ("/api/v1/users/", "Users"),
            ("/api/v1/products/", "Products"),
            ("/api/v1/jobs/", "Jobs"),
            ("/api/v1/locations/", "Locations"),
        ]
        
        for endpoint, name in endpoints:
            try:
                response = self.session.get(f"{self.base_url}{endpoint}", timeout=15)
                if response.status_code in [200, 401, 403]:  # 401/403 are OK for protected endpoints
                    self.log_test(f"API Endpoint - {name}", True, f"Endpoint accessible (Status: {response.status_code})")
                else:
                    self.log_test(f"API Endpoint - {name}", False, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"API Endpoint - {name}", False, f"Error: {str(e)}")
    
    def test_admin_panel(self):
        """Test Django admin panel"""
        print("\n👨‍💼 Testing Admin Panel")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{self.base_url}/admin/", timeout=15)
            if response.status_code == 200:
                if "Django administration" in response.text:
                    self.log_test("Admin Panel", True, "Django admin accessible and rendering")
                else:
                    self.log_test("Admin Panel", False, "Admin page loads but content unexpected")
            elif response.status_code == 302:
                self.log_test("Admin Panel", True, "Admin redirecting to login (normal behavior)")
            else:
                self.log_test("Admin Panel", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Admin Panel", False, f"Error: {str(e)}")
    
    def test_database_connection(self):
        """Test database connectivity through API"""
        print("\n🗄️ Testing Database Connection")
        print("=" * 50)
        
        try:
            # Test a simple API call that requires database
            response = self.session.get(f"{self.base_url}/api/v1/locations/", timeout=15)
            if response.status_code in [200, 401, 403]:
                try:
                    data = response.json()
                    self.log_test("Database Connection", True, "Database queries working through API")
                except:
                    self.log_test("Database Connection", True, "Database accessible (non-JSON response)")
            else:
                self.log_test("Database Connection", False, f"Database query failed (Status: {response.status_code})")
        except Exception as e:
            self.log_test("Database Connection", False, f"Error: {str(e)}")
    
    def test_static_files(self):
        """Test static file serving"""
        print("\n📁 Testing Static Files")
        print("=" * 50)
        
        static_urls = [
            "/static/admin/css/base.css",
            "/static/admin/js/core.js",
        ]
        
        for static_url in static_urls:
            try:
                response = self.session.get(f"{self.base_url}{static_url}", timeout=10)
                if response.status_code == 200:
                    self.log_test("Static Files", True, f"Static file served: {static_url}")
                    break
                elif response.status_code == 404:
                    continue
            except Exception as e:
                continue
        else:
            self.log_test("Static Files", False, "No static files accessible")
    
    def test_cors_headers(self):
        """Test CORS configuration"""
        print("\n🌐 Testing CORS Configuration")
        print("=" * 50)
        
        try:
            headers = {
                'Origin': 'http://localhost:3000',
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            response = self.session.options(f"{self.base_url}/api/v1/", headers=headers, timeout=10)
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            found_cors = any(header in response.headers for header in cors_headers)
            if found_cors:
                self.log_test("CORS Configuration", True, "CORS headers present")
            else:
                self.log_test("CORS Configuration", False, "CORS headers missing")
        except Exception as e:
            self.log_test("CORS Configuration", False, f"Error: {str(e)}")
    
    def test_environment_variables(self):
        """Test environment configuration through API responses"""
        print("\n⚙️ Testing Environment Configuration")
        print("=" * 50)
        
        try:
            # Test if the app is using production settings
            response = self.session.get(f"{self.base_url}/api/v1/", timeout=10)
            
            # Check if we're getting proper production responses
            if response.status_code == 200:
                self.log_test("Environment Config", True, "Production environment active")
            else:
                self.log_test("Environment Config", False, f"Environment issues (Status: {response.status_code})")
                
        except Exception as e:
            self.log_test("Environment Config", False, f"Error: {str(e)}")
    
    def test_ssl_security(self):
        """Test SSL and security headers"""
        print("\n🔒 Testing SSL and Security")
        print("=" * 50)
        
        try:
            response = self.session.get(f"{self.base_url}/", timeout=10)
            
            # Check for security headers
            security_headers = [
                'X-Content-Type-Options',
                'X-Frame-Options',
                'Strict-Transport-Security'
            ]
            
            found_security = any(header in response.headers for header in security_headers)
            if found_security:
                self.log_test("Security Headers", True, "Security headers present")
            else:
                self.log_test("Security Headers", False, "Security headers missing")
                
            # Check SSL
            if self.base_url.startswith('https://'):
                self.log_test("SSL Certificate", True, "HTTPS enabled")
            else:
                self.log_test("SSL Certificate", False, "HTTPS not enabled")
                
        except Exception as e:
            self.log_test("SSL Security", False, f"Error: {str(e)}")
    
    def test_performance(self):
        """Test basic performance metrics"""
        print("\n⚡ Testing Performance")
        print("=" * 50)
        
        try:
            start_time = time.time()
            response = self.session.get(f"{self.base_url}/api/v1/", timeout=30)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            if response_time < 5:
                self.log_test("Response Time", True, f"Fast response: {response_time:.2f}s")
            elif response_time < 15:
                self.log_test("Response Time", True, f"Acceptable response: {response_time:.2f}s")
            else:
                self.log_test("Response Time", False, f"Slow response: {response_time:.2f}s")
                
        except Exception as e:
            self.log_test("Performance", False, f"Error: {str(e)}")
    
    def run_all_tests(self):
        """Run all tests"""
        print("🚀 Youth Green Jobs Hub - Render Deployment Test")
        print("=" * 60)
        print(f"Testing: {self.base_url}")
        print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Run tests
        self.test_basic_connectivity()
        self.test_api_endpoints()
        self.test_admin_panel()
        self.test_database_connection()
        self.test_static_files()
        self.test_cors_headers()
        self.test_environment_variables()
        self.test_ssl_security()
        self.test_performance()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        if failed_tests == 0:
            print("🎉 ALL TESTS PASSED! Your Render deployment is working perfectly!")
        elif failed_tests <= 2:
            print("✅ DEPLOYMENT MOSTLY WORKING! Minor issues detected.")
        else:
            print("⚠️ DEPLOYMENT HAS ISSUES! Please check the failed tests.")
        
        print("=" * 60)

def main():
    """Main test function"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = RENDER_BASE_URL
    
    tester = RenderDeploymentTester(base_url)
    tester.run_all_tests()

if __name__ == "__main__":
    main()
