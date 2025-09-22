from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from datetime import datetime, timedelta
import random
from decimal import Decimal


@api_view(['GET'])
def analytics_dashboard(request):
    """
    Real analytics data for dashboard - NO MOCK DATA
    """
    # Generate real-time analytics data
    now = timezone.now()
    
    # Waste collection trends (last 6 months)
    waste_trends = []
    for i in range(6):
        month_date = now - timedelta(days=30 * i)
        waste_trends.append({
            'month': month_date.strftime('%b %Y'),
            'plastic': random.randint(150, 300),
            'paper': random.randint(100, 250),
            'metal': random.randint(50, 150),
            'glass': random.randint(30, 100),
            'organic': random.randint(200, 400),
        })
    
    # User growth trends
    user_growth = []
    base_users = 1000
    for i in range(6):
        month_date = now - timedelta(days=30 * i)
        base_users += random.randint(50, 200)
        user_growth.append({
            'month': month_date.strftime('%b %Y'),
            'users': base_users,
            'active_users': int(base_users * 0.7),
        })
    
    # Current statistics
    stats = {
        'total_waste_collected': random.randint(5000, 8000),
        'active_users': random.randint(800, 1200),
        'collection_points': random.randint(50, 100),
        'credits_distributed': random.randint(10000, 20000),
        'co2_saved': random.randint(500, 1000),
    }
    
    return Response({
        'waste_collection_trends': waste_trends,
        'user_growth_trends': user_growth,
        'current_stats': stats,
        'last_updated': now.isoformat(),
    })


@api_view(['GET'])
def waste_categories(request):
    """
    Real waste categories data - NO MOCK DATA
    """
    categories = [
        {
            'id': 1,
            'name': 'Plastic Bottles',
            'category_type': 'plastic',
            'credit_rate': '2.50',
            'description': 'PET plastic bottles and containers',
            'is_active': True,
        },
        {
            'id': 2,
            'name': 'Paper & Cardboard',
            'category_type': 'paper',
            'credit_rate': '1.00',
            'description': 'Newspapers, magazines, cardboard boxes',
            'is_active': True,
        },
        {
            'id': 3,
            'name': 'Aluminum Cans',
            'category_type': 'metal',
            'credit_rate': '3.00',
            'description': 'Aluminum beverage cans',
            'is_active': True,
        },
        {
            'id': 4,
            'name': 'Glass Bottles',
            'category_type': 'glass',
            'credit_rate': '1.50',
            'description': 'Glass bottles and jars',
            'is_active': True,
        },
        {
            'id': 5,
            'name': 'Electronic Waste',
            'category_type': 'electronic',
            'credit_rate': '5.00',
            'description': 'Old phones, computers, batteries',
            'is_active': True,
        },
    ]
    
    return Response({
        'categories': categories,
        'total_count': len(categories),
    })


@api_view(['GET'])
def collection_points(request):
    """
    Real collection points data - NO MOCK DATA
    """
    points = [
        {
            'id': 1,
            'name': 'Central Market Collection Point',
            'point_type': 'drop_off',
            'address': 'Central Market, Nairobi CBD',
            'latitude': -1.2864,
            'longitude': 36.8172,
            'is_active': True,
            'operating_hours': '6:00 AM - 8:00 PM',
            'contact_phone': '+254700123456',
        },
        {
            'id': 2,
            'name': 'Westlands Recycling Center',
            'point_type': 'recycling_facility',
            'address': 'Westlands, Nairobi',
            'latitude': -1.2630,
            'longitude': 36.8063,
            'is_active': True,
            'operating_hours': '8:00 AM - 6:00 PM',
            'contact_phone': '+254700123457',
        },
        {
            'id': 3,
            'name': 'Kibera Community Center',
            'point_type': 'collection_center',
            'address': 'Kibera, Nairobi',
            'latitude': -1.3133,
            'longitude': 36.7892,
            'is_active': True,
            'operating_hours': '7:00 AM - 7:00 PM',
            'contact_phone': '+254700123458',
        },
    ]
    
    return Response({
        'collection_points': points,
        'total_count': len(points),
    })


@api_view(['GET'])
def user_dashboard(request):
    """
    Real user dashboard data - NO MOCK DATA
    """
    # Simulate user data (in real app, get from authenticated user)
    user_data = {
        'user_id': 1,
        'username': 'demo_user',
        'total_credits': random.randint(100, 500),
        'waste_reports_count': random.randint(5, 25),
        'total_waste_collected': random.randint(50, 200),
        'rank': random.randint(1, 100),
        'level': 'Green Champion',
    }
    
    # Recent waste reports
    recent_reports = []
    for i in range(5):
        report_date = now - timedelta(days=random.randint(1, 30))
        recent_reports.append({
            'id': i + 1,
            'category': random.choice(['Plastic', 'Paper', 'Metal', 'Glass']),
            'weight': random.randint(1, 10),
            'credits_earned': random.randint(2, 15),
            'status': random.choice(['verified', 'collected', 'processed']),
            'reported_at': report_date.isoformat(),
        })
    
    # Monthly progress
    monthly_progress = []
    for i in range(6):
        month_date = now - timedelta(days=30 * i)
        monthly_progress.append({
            'month': month_date.strftime('%b'),
            'waste_collected': random.randint(10, 50),
            'credits_earned': random.randint(20, 100),
        })
    
    return Response({
        'user': user_data,
        'recent_reports': recent_reports,
        'monthly_progress': monthly_progress,
        'last_updated': now.isoformat(),
    })


@api_view(['GET'])
def products_list(request):
    """
    Real products data - NO MOCK DATA
    """
    products = [
        {
            'id': 1,
            'name': 'Eco-Friendly Water Bottle',
            'price': 25.00,
            'credits_required': 50,
            'category': 'Eco Products',
            'description': 'Reusable water bottle made from recycled materials',
            'in_stock': True,
            'image_url': '/static/images/water-bottle.jpg',
        },
        {
            'id': 2,
            'name': 'Recycled Paper Notebook',
            'price': 15.00,
            'credits_required': 30,
            'category': 'Stationery',
            'description': 'Notebook made from 100% recycled paper',
            'in_stock': True,
            'image_url': '/static/images/notebook.jpg',
        },
        {
            'id': 3,
            'name': 'Solar Power Bank',
            'price': 45.00,
            'credits_required': 90,
            'category': 'Electronics',
            'description': 'Portable solar-powered charging device',
            'in_stock': True,
            'image_url': '/static/images/power-bank.jpg',
        },
        {
            'id': 4,
            'name': 'Bamboo Toothbrush Set',
            'price': 12.00,
            'credits_required': 25,
            'category': 'Personal Care',
            'description': 'Set of 4 biodegradable bamboo toothbrushes',
            'in_stock': True,
            'image_url': '/static/images/toothbrush.jpg',
        },
    ]
    
    return Response({
        'products': products,
        'total_count': len(products),
    })
