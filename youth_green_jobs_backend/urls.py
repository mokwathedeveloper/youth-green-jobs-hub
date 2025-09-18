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


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """
    API root endpoint for Youth Green Jobs & Waste Recycling Hub
    Provides information about available API endpoints
    """
    return Response({
        'message': 'Welcome to Youth Green Jobs & Waste Recycling Hub API',
        'version': 'v1',
        'description': 'Connecting youth with green jobs and eco-friendly opportunities in Kisumu, Kenya',
        'endpoints': {
            'authentication': '/api/v1/auth/',
            'waste_management': '/api/v1/waste/',
            'eco_products': '/api/v1/products/',
            'analytics': '/api/v1/analytics/',
            'admin': '/admin/',
            'docs': '/api/v1/docs/',
        },
        'support': {
            'email': 'support@youthgreenjobs.ke',
            'website': 'https://youthgreenjobs.ke',
        }
    })


urlpatterns = [
    # Admin interface
    path('admin/', admin.site.urls),

    # API root
    path('api/v1/', api_root, name='api_root'),

    # Authentication endpoints
    path('api/v1/auth/', include('authentication.urls')),

    # Waste Collection endpoints
    path('api/v1/waste/', include('waste_collection.urls')),

    # Eco Products endpoints
    path('api/v1/products/', include('products.urls')),

    # Future app endpoints (placeholders)
    # path('api/v1/analytics/', include('analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
