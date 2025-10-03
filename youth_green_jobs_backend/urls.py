"""
URL configuration for youth_green_jobs_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from youth_green_jobs_backend.config import get_platform_info


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API root endpoint for Youth Green Jobs & Waste Recycling Hub
    Provides information about available API endpoints
    """
    platform_info = get_platform_info()
    return Response({
        'message': f'Welcome to {platform_info["name"]} API',
        'version': platform_info['version'],
        'description': 'Connecting youth with green jobs and eco-friendly opportunities',
        'status': 'operational',
        'endpoints': {
            'authentication': '/api/v1/auth/',
            'waste_management': '/api/v1/waste/',
            'eco_products': '/api/v1/products/',
            'analytics': '/api/v1/analytics/',
            'health': '/health/',
            'admin': '/admin/',
            'docs': '/api/v1/docs/',
        },
        'support': {
            'email': platform_info['support_email'],
            'website': platform_info['support_website'],
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Simple health check endpoint for monitoring
    """
    from django.db import connection
    try:
        # Test database connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return Response({
        'status': 'healthy',
        'database': db_status,
        'timestamp': request.META.get('HTTP_DATE', 'unknown')
    })





urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),

    # Root redirect to API
    path('', api_root, name='root'),

    # Health check
    path('health/', health_check, name='health_check'),



    # API root
    path('api/v1/', api_root, name='api_root'),

    # Authentication endpoints
    path('api/v1/auth/', include('authentication.urls')),

    # Waste Collection endpoints
    path('api/v1/waste/', include('waste_collection.urls')),

    # Eco Products endpoints
    path('api/v1/products/', include('products.urls')),

    # Analytics endpoints
    path('api/v1/analytics/', include('analytics.urls')),

    # Gamification endpoints
    path('api/v1/gamification/', include('gamification.urls')),

    # Partnership endpoints
    path('api/v1/partnerships/', include('partnerships.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
