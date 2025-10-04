#!/usr/bin/env python3
"""
Script to create images for production via API call
"""
import requests
import json

def create_images_via_api():
    """Create images for products via emergency API endpoint"""
    print("🎨 Creating Production Images via API")
    print("=" * 40)
    
    try:
        # Call the emergency populate endpoint which should create images
        url = "https://youth-green-jobs-hub.onrender.com/api/v1/auth/emergency/populate-database/"
        data = {"secret": "YouthGreenJobs2024Emergency!"}
        
        print("📡 Calling populate endpoint...")
        response = requests.post(url, json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Populate API response:")
            print(f"   Success: {result.get('success', False)}")
            print(f"   Message: {result.get('message', 'Unknown')}")
            
            if 'after' in result:
                after = result['after']
                print(f"   Products: {after.get('products', 0)}")
                print(f"   Categories: {after.get('categories', 0)}")
                print(f"   Vendors: {after.get('vendors', 0)}")
            
            return True
        else:
            print(f"❌ API call failed: {response.status_code}")
            print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Error calling API: {e}")
        return False

def verify_images():
    """Verify that images are now available"""
    print("\n🔍 Verifying Images...")
    
    try:
        # Check products API for image URLs
        response = requests.get("https://youth-green-jobs-hub.onrender.com/api/v1/products/products/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('results', [])
            
            print(f"📊 Found {len(products)} products")
            
            images_count = 0
            for product in products:
                if product.get('featured_image'):
                    images_count += 1
                    print(f"   ✅ {product['name']}: Has image")
                else:
                    print(f"   ❌ {product['name']}: No image")
            
            print(f"\n📈 Images Status: {images_count}/{len(products)} products have images")
            return images_count > 0
        else:
            print(f"❌ Cannot check products: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error checking images: {e}")
        return False

def create_simple_image_urls():
    """Create simple placeholder image URLs using a service"""
    print("\n🖼️ Alternative: Using Placeholder Image Service")
    
    # We can use placeholder image services like:
    # - https://via.placeholder.com/400x300/3498db/ffffff?text=Product+Name
    # - https://picsum.photos/400/300
    
    placeholder_base = "https://via.placeholder.com/400x300"
    colors = ["3498db", "2ecc71", "e74c3c", "f39c12", "9b59b6", "1abc9c"]
    
    print("📋 Suggested placeholder URLs:")
    for i, color in enumerate(colors):
        url = f"{placeholder_base}/{color}/ffffff?text=Product+{i+1}"
        print(f"   Product {i+1}: {url}")
    
    print("\n💡 These can be used as featured_image URLs in the database")

def main():
    print("🚀 Youth Green Jobs Hub - Production Image Creation")
    print("=" * 55)
    
    # Try to create images via API
    success = create_images_via_api()
    
    if success:
        # Verify images were created
        if verify_images():
            print("\n🎉 SUCCESS! Images are now available")
            print("\n✅ Next Steps:")
            print("   1. Check frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products")
            print("   2. Images should now display properly")
        else:
            print("\n⚠️ Images may still be processing...")
            print("   Wait a few minutes and check the frontend")
    else:
        print("\n❌ API approach failed")
        create_simple_image_urls()
        print("\n🔧 Manual Solution:")
        print("   1. Go to Django admin")
        print("   2. Edit each product manually")
        print("   3. Add placeholder image URLs")

if __name__ == "__main__":
    main()
