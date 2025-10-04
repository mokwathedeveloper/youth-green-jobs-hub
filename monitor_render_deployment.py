#!/usr/bin/env python3
"""
Script to monitor Render deployment and check if populate_products is working
"""
import requests
import time
import json
from datetime import datetime

def check_api_health():
    """Check if the API is responding and get basic info"""
    try:
        response = requests.get("https://youth-green-jobs-hub.onrender.com/api/v1/", timeout=10)
        if response.status_code == 200:
            data = response.json()
            return True, data
        else:
            return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)

def check_database_counts():
    """Check current database counts"""
    endpoints = {
        'products': '/api/v1/products/products/',
        'categories': '/api/v1/products/categories/',
        'vendors': '/api/v1/products/vendors/'
    }
    
    counts = {}
    for name, endpoint in endpoints.items():
        try:
            response = requests.get(f"https://youth-green-jobs-hub.onrender.com{endpoint}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                counts[name] = data.get('count', 0)
            else:
                counts[name] = f"Error: {response.status_code}"
        except Exception as e:
            counts[name] = f"Error: {str(e)}"
    
    return counts

def check_admin_access():
    """Check if Django admin is accessible"""
    try:
        response = requests.get("https://youth-green-jobs-hub.onrender.com/admin/", timeout=10)
        if response.status_code == 200:
            return True, "Admin accessible"
        elif response.status_code == 302:
            return True, "Admin accessible (redirected to login)"
        else:
            return False, f"HTTP {response.status_code}"
    except Exception as e:
        return False, str(e)

def monitor_deployment_status():
    """Monitor deployment status over time"""
    print("🔍 Monitoring Render Deployment Status")
    print("=" * 50)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    for i in range(10):  # Check 10 times over 5 minutes
        print(f"📊 Check #{i+1}/10 - {datetime.now().strftime('%H:%M:%S')}")
        
        # Check API health
        api_healthy, api_info = check_api_health()
        if api_healthy:
            print("✅ API is responding")
            print(f"   Version: {api_info.get('version', 'Unknown')}")
            print(f"   Status: {api_info.get('status', 'Unknown')}")
        else:
            print(f"❌ API not responding: {api_info}")
            
        # Check database counts
        counts = check_database_counts()
        print(f"📦 Database counts:")
        for name, count in counts.items():
            if isinstance(count, int):
                status = "✅" if count > 0 else "⚠️"
                print(f"   {status} {name.capitalize()}: {count}")
            else:
                print(f"   ❌ {name.capitalize()}: {count}")
        
        # Check admin access
        admin_ok, admin_info = check_admin_access()
        admin_status = "✅" if admin_ok else "❌"
        print(f"{admin_status} Admin: {admin_info}")
        
        # Check if we have data
        has_data = all(isinstance(count, int) and count > 0 for count in counts.values())
        if has_data:
            print("🎉 SUCCESS: Database has been populated!")
            print("🔗 Check frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products")
            break
        
        print("-" * 30)
        
        if i < 9:  # Don't sleep on the last iteration
            time.sleep(30)  # Wait 30 seconds between checks
    
    return has_data

def suggest_troubleshooting_steps():
    """Suggest steps to troubleshoot deployment issues"""
    print("\n🔧 Troubleshooting Steps:")
    print("=" * 30)
    print("1. 📋 Check Render Dashboard:")
    print("   - Go to https://dashboard.render.com")
    print("   - Find your 'youth-green-jobs-hub' service")
    print("   - Click on 'Logs' tab to see deployment logs")
    print("   - Look for 'populate_products' command output")
    print()
    print("2. 🔍 Look for these in the logs:")
    print("   - '🌱 Populating sample products data...'")
    print("   - 'Successfully populated database with:'")
    print("   - Any error messages related to populate_products")
    print()
    print("3. 🚀 If populate_products failed:")
    print("   - Use Django Admin to manually populate")
    print("   - Go to: https://youth-green-jobs-hub.onrender.com/admin/")
    print("   - Login with superuser credentials")
    print("   - Go to Products > Product categories")
    print("   - Select any item and use 'Populate database with sample data' action")
    print()
    print("4. 🔄 Force new deployment:")
    print("   - Make a small change to any file")
    print("   - Commit and push to main branch")
    print("   - Render will automatically redeploy")

def main():
    print("🚀 Youth Green Jobs Hub - Render Deployment Monitor")
    print("=" * 60)
    
    # Initial status check
    print("🔍 Initial Status Check:")
    api_healthy, api_info = check_api_health()
    if not api_healthy:
        print(f"❌ API not responding: {api_info}")
        print("⏳ Deployment might still be in progress...")
        print()
    
    # Monitor deployment
    success = monitor_deployment_status()
    
    if not success:
        print("\n⚠️ Database still appears to be empty after monitoring")
        suggest_troubleshooting_steps()
    
    print(f"\n📊 Final Status at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}:")
    counts = check_database_counts()
    for name, count in counts.items():
        print(f"   {name.capitalize()}: {count}")
    
    print("\n🔗 Important URLs:")
    print("   Backend API: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/")
    print("   Django Admin: https://youth-green-jobs-hub.onrender.com/admin/")
    print("   Frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products")

if __name__ == "__main__":
    main()
