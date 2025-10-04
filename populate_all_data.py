#!/usr/bin/env python3
"""
Complete script to populate ALL sections with sample data
"""
import os
import sys
import django
from decimal import Decimal
from datetime import datetime, timedelta
import uuid

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'youth_green_jobs_backend.settings')
django.setup()

from django.contrib.auth.models import Group
from authentication.models import User
from products.models import (
    ProductCategory, SMEVendor, Product, ProductImage, 
    ProductReview, Order, OrderItem, ShoppingCart, CartItem
)
from waste_collection.simple_models import (
    WasteCategory, CollectionPoint, CollectionEvent,
    EventParticipation, WasteReport, CreditTransaction
)

def create_groups():
    """Create user groups"""
    print("👥 Creating User Groups...")
    
    groups_data = [
        'Youth Users',
        'SME Vendors', 
        'Collection Agents',
        'Administrators',
        'Moderators'
    ]
    
    created_count = 0
    for group_name in groups_data:
        group, created = Group.objects.get_or_create(name=group_name)
        if created:
            created_count += 1
            print(f"   ✅ Created group: {group_name}")
    
    print(f"📊 Created {created_count} new groups")
    return Group.objects.all()

def create_users():
    """Create sample users"""
    print("\n👤 Creating Users...")
    
    users_data = [
        {
            'username': 'john_doe',
            'email': 'john@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'user_type': 'youth',
            'county': 'Nairobi'
        },
        {
            'username': 'mary_smith',
            'email': 'mary@example.com', 
            'first_name': 'Mary',
            'last_name': 'Smith',
            'user_type': 'sme_owner',
            'county': 'Kisumu'
        },
        {
            'username': 'peter_jones',
            'email': 'peter@example.com',
            'first_name': 'Peter', 
            'last_name': 'Jones',
            'user_type': 'collection_agent',
            'county': 'Mombasa'
        }
    ]
    
    created_count = 0
    users = []
    
    for user_data in users_data:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
                'user_type': user_data['user_type'],
                'county': user_data['county'],
                'phone_number': f"+25470{created_count + 1}123456",
                'is_active': True
            }
        )
        users.append(user)
        if created:
            user.set_password('password123')
            user.save()
            created_count += 1
            print(f"   ✅ Created user: {user_data['username']}")
    
    print(f"📊 Created {created_count} new users")
    return users

def create_waste_categories():
    """Create waste categories"""
    print("\n♻️ Creating Waste Categories...")
    
    categories_data = [
        {'name': 'Plastic Bottles', 'category_type': 'plastic', 'description': 'PET and plastic bottles', 'credit_rate': 10},
        {'name': 'Paper & Cardboard', 'category_type': 'paper', 'description': 'Newspapers, magazines, cardboard', 'credit_rate': 5},
        {'name': 'Metal Cans', 'category_type': 'metal', 'description': 'Aluminum and steel cans', 'credit_rate': 15},
        {'name': 'Glass Bottles', 'category_type': 'glass', 'description': 'Glass bottles and jars', 'credit_rate': 8},
        {'name': 'Electronic Waste', 'category_type': 'electronic', 'description': 'Old phones, computers, batteries', 'credit_rate': 25}
    ]
    
    created_count = 0
    for cat_data in categories_data:
        category, created = WasteCategory.objects.get_or_create(
            name=cat_data['name'],
            defaults=cat_data
        )
        if created:
            created_count += 1
            print(f"   ✅ Created waste category: {cat_data['name']}")
    
    print(f"📊 Created {created_count} new waste categories")
    return WasteCategory.objects.all()

def create_collection_points():
    """Create collection points"""
    print("\n📍 Creating Collection Points...")
    
    points_data = [
        {
            'name': 'Kisumu Central Collection Point',
            'address': 'Kisumu CBD, Kenya',
            'point_type': 'collection_center',
            'latitude': -0.0917,
            'longitude': 34.7680,
            'contact_phone': '+254701234567',
            'operating_hours': '8:00 AM - 6:00 PM'
        },
        {
            'name': 'Nairobi Westlands Point',
            'address': 'Westlands, Nairobi',
            'point_type': 'drop_off',
            'latitude': -1.2641,
            'longitude': 36.8084,
            'contact_phone': '+254702345678',
            'operating_hours': '9:00 AM - 5:00 PM'
        }
    ]
    
    created_count = 0
    for point_data in points_data:
        point, created = CollectionPoint.objects.get_or_create(
            name=point_data['name'],
            defaults=point_data
        )
        if created:
            created_count += 1
            print(f"   ✅ Created collection point: {point_data['name']}")
    
    print(f"📊 Created {created_count} new collection points")
    return CollectionPoint.objects.all()

def main():
    print("🚀 COMPLETE DATA POPULATION - Youth Green Jobs Hub")
    print("=" * 60)
    
    try:
        # Create all data
        groups = create_groups()
        users = create_users()
        waste_categories = create_waste_categories()
        collection_points = create_collection_points()
        
        print("\n🎉 POPULATION COMPLETE!")
        print("=" * 30)
        print(f"✅ Groups: {groups.count()}")
        print(f"✅ Users: {len(users)}")
        print(f"✅ Waste Categories: {waste_categories.count()}")
        print(f"✅ Collection Points: {collection_points.count()}")
        
        print("\n📋 Next Steps:")
        print("1. Run the existing populate_products command for products")
        print("2. Use Django admin actions for additional data")
        print("3. Check all sections in Django admin")
        
    except Exception as e:
        print(f"❌ Error during population: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
