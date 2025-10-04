#!/usr/bin/env python3
"""
Script to create superuser and populate database locally, then provide instructions
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Run a command and return success status"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True, cwd="/home/john/Desktop/youth-green-jobs-hub")
        if result.returncode == 0:
            print(f"✅ {description} - Success")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {description} - Failed")
            if result.stderr.strip():
                print(f"   Error: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False

def main():
    print("🚀 Youth Green Jobs Hub - Local Setup and Production Guide")
    print("=" * 65)
    
    # Activate virtual environment and create superuser locally
    commands = [
        ("source venv_working/bin/activate && python manage.py createsuperuser --noinput --username admin --email moffatmokwa12@gmail.com", "Creating local superuser"),
        ("source venv_working/bin/activate && python manage.py populate_products", "Populating local database"),
    ]
    
    for command, description in commands:
        run_command(command, description)
    
    print("\n📊 Local Database Status:")
    run_command("source venv_working/bin/activate && python manage.py shell -c \"from authentication.models import User; from products.models import Product; print(f'Users: {User.objects.count()}, Products: {Product.objects.count()}')\"", "Checking local database")
    
    print("\n🔧 Production Solutions:")
    print("=" * 25)
    print("1. 🎯 **Try Django Admin Login:**")
    print("   URL: https://youth-green-jobs-hub.onrender.com/admin/")
    print("   Username: admin")
    print("   Password: YouthGreenJobs2024!")
    print()
    print("2. 🔄 **If login fails, the build script should have created the user.**")
    print("   Check Render logs for superuser creation messages.")
    print()
    print("3. 📱 **Alternative: Use Django Admin Actions:**")
    print("   - Once you can login to admin")
    print("   - Go to Products > Product categories")
    print("   - Select any item")
    print("   - Choose 'Populate database with sample data' action")
    print("   - Click 'Go'")
    print()
    print("4. 🚀 **Force new deployment:**")
    print("   - The latest deployment should have improved superuser creation")
    print("   - Check deployment logs on Render dashboard")
    print()
    print("5. 🔍 **Check production database:**")
    print("   - API: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/")
    print("   - Should show products count > 0 when populated")
    print()
    print("📋 **Next Steps:**")
    print("1. Try logging into Django admin with admin/YouthGreenJobs2024!")
    print("2. If successful, use admin actions to populate database")
    print("3. Check frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products")
    print("4. Verify products appear in frontend")

if __name__ == "__main__":
    main()
