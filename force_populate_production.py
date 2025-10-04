#!/usr/bin/env python3
"""
Script to force populate production database via API calls
Since we can't directly access Render's database, we'll create data via API
"""
import requests
import json

def create_sample_data_via_api():
    """Create sample data by making API calls to the production backend"""
    base_url = "https://youth-green-jobs-hub.onrender.com/api/v1"
    
    print("🌱 Force Populating Production Database via API")
    print("=" * 50)
    
    # Sample data
    categories = [
        {"name": "Renewable Energy", "description": "Solar panels, wind turbines, and clean energy solutions"},
        {"name": "Waste Management", "description": "Recycling, composting, and waste reduction products"},
        {"name": "Sustainable Agriculture", "description": "Organic farming tools and eco-friendly fertilizers"},
        {"name": "Water Conservation", "description": "Water-saving devices and purification systems"},
        {"name": "Green Transportation", "description": "Electric vehicles and sustainable transport solutions"}
    ]
    
    vendors = [
        {
            "business_name": "EcoSolar Kenya",
            "business_type": "renewable_energy",
            "description": "Leading provider of solar energy solutions in Kenya",
            "county": "Nairobi",
            "contact_phone": "+254700123456",
            "contact_email": "info@ecosolar.ke",
            "address": "123 Solar Street, Nairobi"
        },
        {
            "business_name": "Green Waste Solutions",
            "business_type": "waste_management", 
            "description": "Comprehensive waste management and recycling services",
            "county": "Kisumu",
            "contact_phone": "+254700234567",
            "contact_email": "contact@greenwaste.co.ke",
            "address": "456 Recycle Road, Kisumu"
        }
    ]
    
    products = [
        {
            "name": "Solar Panel Kit 100W",
            "description": "Complete solar panel kit for home energy needs",
            "price": "15000.00",
            "category": 1,  # Will be updated with actual category ID
            "vendor": 1,    # Will be updated with actual vendor ID
            "stock_quantity": 50,
            "is_available": True
        },
        {
            "name": "Compost Bin Set",
            "description": "Eco-friendly composting solution for organic waste",
            "price": "2500.00", 
            "category": 2,
            "vendor": 2,
            "stock_quantity": 30,
            "is_available": True
        }
    ]
    
    try:
        # First, check if we can access admin endpoints or if there's a way to create data
        print("🔍 Checking available endpoints...")
        
        # Check if there's an admin interface or data creation endpoint
        endpoints_to_check = [
            "/admin/",
            "/api/v1/products/categories/",
            "/api/v1/products/vendors/", 
            "/api/v1/products/products/"
        ]
        
        for endpoint in endpoints_to_check:
            try:
                response = requests.get(f"{base_url}{endpoint}")
                print(f"✅ {endpoint}: {response.status_code}")
                
                if endpoint.endswith("categories/") and response.status_code == 200:
                    data = response.json()
                    print(f"   Categories count: {data.get('count', 0)}")
                    
            except Exception as e:
                print(f"❌ {endpoint}: {str(e)}")
        
        print("\n💡 Since we can't directly create data via API (no authentication),")
        print("   we need to ensure the populate_products command runs on Render.")
        print("\n🔧 Solutions:")
        print("1. The build script should run populate_products during deployment")
        print("2. We can trigger a new deployment to force the command to run")
        print("3. We can check Render logs to see if the command failed")
        
        return False
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def trigger_new_deployment():
    """Suggest ways to trigger a new deployment"""
    print("\n🚀 How to Trigger New Deployment:")
    print("=" * 40)
    print("1. Make a small change to any file and push to main branch")
    print("2. Render will automatically detect the change and redeploy")
    print("3. The build script will run populate_products command")
    print("4. Wait 3-5 minutes for deployment to complete")
    print("5. Test the API again")

def main():
    print("🎯 Production Database Population Strategy")
    print("=" * 50)
    
    # Try to create data via API
    success = create_sample_data_via_api()
    
    if not success:
        trigger_new_deployment()
    
    print("\n📋 Next Steps:")
    print("1. Trigger a new deployment by pushing a small change")
    print("2. Monitor deployment logs on Render dashboard") 
    print("3. Test the API after deployment completes")
    print("4. Check frontend to see if products appear")
    
    print(f"\n🔗 Monitor these URLs:")
    print(f"Backend API: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/")
    print(f"Frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products")

if __name__ == "__main__":
    main()
