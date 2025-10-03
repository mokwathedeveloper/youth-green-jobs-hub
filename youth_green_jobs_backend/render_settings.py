"""
Django settings for Youth Green Jobs Hub on Render.com
"""

import os
import dj_database_url
from .settings import *

# SECURITY WARNING: don't run with debug turned on in production!
# Temporarily enable debug to see the exact registration error
DEBUG = True

# Get the secret key from environment or generate one
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-me-in-production')

# Render.com provides the hostname
RENDER_EXTERNAL_HOSTNAME = os.environ.get('RENDER_EXTERNAL_HOSTNAME')
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

# Add common Render hostnames
ALLOWED_HOSTS.extend([
    'youth-green-jobs-api.onrender.com',
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
])

# Database configuration for Render PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    DATABASES['default'] = dj_database_url.parse(DATABASE_URL, conn_max_age=600)
    # Ensure we use PostGIS engine
    DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'

# Static files configuration for Render
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Use WhiteNoise for serving static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS configuration for Render
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    # Vercel deployment URLs
    "https://frontend-1aygxoocr-moracios-projects.vercel.app",
    "https://frontend-jjlupadi3-moracios-projects.vercel.app",
    "https://frontend-three-ashy-66.vercel.app",
    "https://frontend-p7kzkioe8-moracios-projects.vercel.app",
]

# Add environment-based CORS origins
CORS_ORIGINS_FROM_ENV = os.environ.get('CORS_ALLOWED_ORIGINS', '')
if CORS_ORIGINS_FROM_ENV:
    additional_origins = [origin.strip() for origin in CORS_ORIGINS_FROM_ENV.split(',') if origin.strip()]
    CORS_ALLOWED_ORIGINS.extend(additional_origins)

# Add Render frontend URL when available
RENDER_FRONTEND_URL = os.environ.get('RENDER_FRONTEND_URL')
if RENDER_FRONTEND_URL:
    CORS_ALLOWED_ORIGINS.append(RENDER_FRONTEND_URL)

# Add Vercel URL when available
VERCEL_URL = os.environ.get('VERCEL_URL')
if VERCEL_URL:
    CORS_ALLOWED_ORIGINS.append(f"https://{VERCEL_URL}")

# Remove duplicates
CORS_ALLOWED_ORIGINS = list(set(CORS_ALLOWED_ORIGINS))

# Use specific allowed origins for security (not all origins)
CORS_ALLOW_ALL_ORIGINS = False

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

# Security settings for production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Session and CSRF cookie security
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

# Email configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# Platform configuration
PLATFORM_NAME = os.environ.get('PLATFORM_NAME', 'Youth Green Jobs Hub')
DEFAULT_COUNTY = os.environ.get('DEFAULT_COUNTY', 'Kisumu')
DEFAULT_COUNTRY = os.environ.get('DEFAULT_COUNTRY', 'Kenya')
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', 'support@youthgreenjobs.ke')

# Payment gateway configuration
# M-Pesa
MPESA_CONSUMER_KEY = os.environ.get('MPESA_CONSUMER_KEY')
MPESA_CONSUMER_SECRET = os.environ.get('MPESA_CONSUMER_SECRET')
MPESA_BUSINESS_SHORT_CODE = os.environ.get('MPESA_BUSINESS_SHORT_CODE')
MPESA_PASSKEY = os.environ.get('MPESA_PASSKEY')
MPESA_SANDBOX = os.environ.get('MPESA_SANDBOX', 'True').lower() == 'true'

# Paystack
PAYSTACK_PUBLIC_KEY = os.environ.get('PAYSTACK_PUBLIC_KEY')
PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY')
PAYSTACK_SANDBOX = os.environ.get('PAYSTACK_SANDBOX', 'True').lower() == 'true'

# Google Maps
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')
GOOGLE_MAPS_JS_API_KEY = os.environ.get('GOOGLE_MAPS_JS_API_KEY')

# Callback URLs for payments (will be updated with actual Render URL)
SITE_URL = f"https://{RENDER_EXTERNAL_HOSTNAME}" if RENDER_EXTERNAL_HOSTNAME else "https://youth-green-jobs-api.onrender.com"
MPESA_CALLBACK_URL = f"{SITE_URL}/api/v1/products/payments/webhook/mpesa/"
PAYSTACK_CALLBACK_URL = f"{SITE_URL}/api/v1/products/payments/webhook/paystack/"

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Cache configuration (optional - can use Redis on Render)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}

print(f"🚀 Render Settings Loaded")
print(f"   Debug: {DEBUG}")
print(f"   Allowed Hosts: {ALLOWED_HOSTS}")
print(f"   Database: {'Configured' if DATABASE_URL else 'Not configured'}")
print(f"   Site URL: {SITE_URL}")
print(f"   CORS Allowed Origins: {CORS_ALLOWED_ORIGINS}")
