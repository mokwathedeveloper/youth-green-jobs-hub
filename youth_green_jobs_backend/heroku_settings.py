"""
Heroku-specific Django settings for Youth Green Jobs Backend
"""

from .settings import *
import dj_database_url
import os

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Heroku provides the app name in the HOST header
ALLOWED_HOSTS = [
    '.herokuapp.com',
    'localhost',
    '127.0.0.1',
    'youthgreenjobs.ke',
    'www.youthgreenjobs.ke'
]

# Database configuration for Heroku PostgreSQL
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}

# Override engine to use PostGIS for spatial support
DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'

# Static files configuration for Heroku
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add WhiteNoise middleware for static files
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# CORS configuration for Vercel frontend
CORS_ALLOWED_ORIGINS = [
    "https://youth-green-jobs-frontend.vercel.app",  # Update with your actual Vercel URL
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

CORS_ALLOW_CREDENTIALS = True

# CSRF trusted origins
CSRF_TRUSTED_ORIGINS = [
    "https://youth-green-jobs-frontend.vercel.app",  # Update with your actual Vercel URL
    "https://*.herokuapp.com",
    "http://localhost:3000",
    "http://localhost:5173",
]

# Security settings for production
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'

# Session and CSRF cookies
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = 'Lax'

# Logging configuration for Heroku
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

# Email configuration (use environment variables)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')

# Payment configuration (use environment variables)
MPESA_CONSUMER_KEY = os.environ.get('MPESA_CONSUMER_KEY')
MPESA_CONSUMER_SECRET = os.environ.get('MPESA_CONSUMER_SECRET')
MPESA_BUSINESS_SHORT_CODE = os.environ.get('MPESA_BUSINESS_SHORT_CODE')
MPESA_PASSKEY = os.environ.get('MPESA_PASSKEY')
MPESA_SANDBOX = os.environ.get('MPESA_SANDBOX', 'True').lower() == 'true'

PAYSTACK_PUBLIC_KEY = os.environ.get('PAYSTACK_PUBLIC_KEY')
PAYSTACK_SECRET_KEY = os.environ.get('PAYSTACK_SECRET_KEY')
PAYSTACK_SANDBOX = os.environ.get('PAYSTACK_SANDBOX', 'True').lower() == 'true'

# Google Maps API
GOOGLE_MAPS_API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

# Platform configuration
PLATFORM_NAME = os.environ.get('PLATFORM_NAME', 'Youth Green Jobs Hub')
DEFAULT_COUNTY = os.environ.get('DEFAULT_COUNTY', 'Kisumu')
DEFAULT_COUNTRY = os.environ.get('DEFAULT_COUNTRY', 'Kenya')
SUPPORT_EMAIL = os.environ.get('SUPPORT_EMAIL', 'support@youthgreenjobs.ke')

# Cache configuration (using Heroku Redis if available)
if 'REDIS_URL' in os.environ:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': os.environ.get('REDIS_URL'),
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            }
        }
    }
