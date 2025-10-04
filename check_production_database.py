#!/usr/bin/env python3
"""
Script to check production database status and trigger data population
"""
import requests
import json
import time

def check_production_status():
    """Check the current status of production database"""
    base_url = "https://youth-green-jobs-hub.onrender.com/api/v1"
    
    print("🔍 Checking Production Database Status")
    print("=" * 50)
    
    try:
        # Test API root
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            print("✅ Backend API is running")
        else:
            print(f"❌ Backend API error: {response.status_code}")
            return False
            
        # Check products
        response = requests.get(f"{base_url}/products/products/")
        if response.status_code == 200:
            data = response.json()
            product_count = data.get('count', 0)
            print(f"📦 Products in database: {product_count}")
            
            if product_count == 0:
                print("⚠️  No products found - database needs population")
                return False
            else:
                print("✅ Products are available")
                return True
        else:
            print(f"❌ Products API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return False

def test_frontend_backend_connection():
    """Test if frontend can connect to backend"""
    print("\n🌐 Testing Frontend-Backend Connection")
    print("=" * 50)
    
    frontend_url = "https://frontend-three-ashy-66.vercel.app"
    backend_url = "https://youth-green-jobs-hub.onrender.com"
    
    try:
        # Test frontend
        response = requests.get(frontend_url)
        if response.status_code == 200:
            print("✅ Frontend is accessible")
        else:
            print(f"❌ Frontend error: {response.status_code}")
            
        # Test CORS
        headers = {
            'Origin': frontend_url,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{backend_url}/api/v1/products/products/", headers=headers)
        if response.status_code == 200:
            print("✅ CORS is configured correctly")
        else:
            print(f"⚠️  CORS might have issues: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Connection test error: {e}")

def main():
    print("🚀 Youth Green Jobs Hub - Production Database Check")
    print("=" * 60)
    
    # Check database status
    has_data = check_production_status()
    
    # Test frontend-backend connection
    test_frontend_backend_connection()
    
    print("\n📊 Summary")
    print("=" * 20)
    
    if has_data:
        print("✅ Production database has data")
        print("✅ Frontend should display products")
        print(f"🔗 Check: https://frontend-three-ashy-66.vercel.app/dashboard/products")
    else:
        print("⚠️  Production database is empty")
        print("💡 Solution: Trigger Render redeploy to populate data")
        print("💡 Or wait for current deployment to complete")
        
    print(f"\n🔗 Direct API test: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/")

if __name__ == "__main__":
    main()
