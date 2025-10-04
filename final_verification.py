#!/usr/bin/env python3
"""
Final verification script to check if the goal is achieved
"""
import requests
import time
import json

def check_api_status():
    """Check if API is responding"""
    try:
        response = requests.get("https://youth-green-jobs-hub.onrender.com/api/v1/", timeout=10)
        return response.status_code == 200
    except:
        return False

def check_database_population():
    """Check if database is populated"""
    endpoints = {
        'products': '/api/v1/products/products/',
        'categories': '/api/v1/products/categories/',
        'vendors': '/api/v1/products/vendors/'
    }
    
    results = {}
    for name, endpoint in endpoints.items():
        try:
            response = requests.get(f"https://youth-green-jobs-hub.onrender.com{endpoint}", timeout=10)
            if response.status_code == 200:
                data = response.json()
                results[name] = data.get('count', 0)
            else:
                results[name] = f"Error: {response.status_code}"
        except Exception as e:
            results[name] = f"Error: {str(e)}"
    
    return results

def test_frontend_access():
    """Test if frontend is accessible"""
    try:
        response = requests.get("https://frontend-three-ashy-66.vercel.app/dashboard/products", timeout=10)
        return response.status_code == 200
    except:
        return False

def main():
    print("🎯 FINAL VERIFICATION - Youth Green Jobs Hub")
    print("=" * 50)
    
    # Wait for deployment if needed
    print("⏰ Checking deployment status...")
    for i in range(6):  # Check 6 times over 3 minutes
        if check_api_status():
            print("✅ API is responding!")
            break
        else:
            print(f"⏳ Waiting for deployment... ({i+1}/6)")
            time.sleep(30)
    
    if not check_api_status():
        print("❌ API still not responding after 3 minutes")
        print("   Deployment may still be in progress")
        print("   Please wait a few more minutes and try again")
        return
    
    # Check database population
    print("\n📊 Database Population Status:")
    results = check_database_population()
    
    total_items = 0
    for name, count in results.items():
        if isinstance(count, int):
            total_items += count
            status = "✅" if count > 0 else "⚠️"
            print(f"   {status} {name.capitalize()}: {count}")
        else:
            print(f"   ❌ {name.capitalize()}: {count}")
    
    # Check frontend
    print("\n🌐 Frontend Status:")
    if test_frontend_access():
        print("   ✅ Frontend is accessible")
    else:
        print("   ❌ Frontend not accessible")
    
    # Final assessment
    print("\n🎯 GOAL ACHIEVEMENT STATUS:")
    print("=" * 30)
    
    if total_items > 0:
        print("🎉 SUCCESS! Database has been populated!")
        print(f"   Total items: {total_items}")
        print("\n✅ Next Steps:")
        print("   1. Visit: https://frontend-three-ashy-66.vercel.app/dashboard/products")
        print("   2. You should now see products displayed!")
        print("   3. Test browsing, searching, and product details")
        print("\n🔗 Important URLs:")
        print("   Frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products")
        print("   API: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/")
        print("   Admin: https://youth-green-jobs-hub.onrender.com/admin/")
    else:
        print("⚠️ Database is still empty")
        print("\n🔧 Manual Solution:")
        print("   1. Go to: https://youth-green-jobs-hub.onrender.com/admin/")
        print("   2. Login: admin / YouthGreenJobs2024!")
        print("   3. Products → Product categories")
        print("   4. Select 'Populate database with sample data' action")
        print("   5. Click 'Go'")
        print("\n   Then run this script again to verify!")

if __name__ == "__main__":
    main()
