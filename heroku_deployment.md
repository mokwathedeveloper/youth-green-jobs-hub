# 🚀 Heroku Backend Deployment Guide

## Prerequisites
1. Install Heroku CLI: `npm install -g heroku`
2. Create Heroku account
3. Have your code ready in Git repository

## Step 1: Prepare for Heroku

### Create Heroku-specific files:

**1. Create `Procfile`:**
```
web: gunicorn youth_green_jobs_backend.wsgi:application --bind 0.0.0.0:$PORT
release: python manage.py migrate
```

**2. Create `runtime.txt`:**
```
python-3.12.7
```

**3. Update `requirements.txt` for Heroku:**
```bash
# Add these to your requirements.txt
gunicorn==21.2.0
dj-database-url==2.1.0
whitenoise==6.6.0
psycopg2-binary==2.9.10
```

**4. Create `heroku_settings.py`:**
```python
from .settings import *
import dj_database_url
import os

# Heroku-specific settings
DEBUG = False
ALLOWED_HOSTS = ['your-app-name.herokuapp.com', 'localhost', '127.0.0.1']

# Database
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}
DATABASES['default']['ENGINE'] = 'django.contrib.gis.db.backends.postgis'

# Static files
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS for Vercel frontend
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-app.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "https://your-frontend-app.vercel.app",
    "https://your-app-name.herokuapp.com",
]
```

## Step 2: Deploy to Heroku

### 1. Login and Create App
```bash
heroku login
heroku create your-youth-green-jobs-api
```

### 2. Add PostgreSQL with PostGIS
```bash
heroku addons:create heroku-postgresql:essential-0
heroku pg:psql -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 3. Set Environment Variables
```bash
# Django settings
heroku config:set DJANGO_SETTINGS_MODULE=youth_green_jobs_backend.heroku_settings
heroku config:set SECRET_KEY="M@nnV$96)y+E^5eIndW&OYs5Lk50_SdMc29Zd_8Zbn&bb=!Gz7"

# Platform settings
heroku config:set PLATFORM_NAME="Youth Green Jobs Hub"
heroku config:set DEFAULT_COUNTY="Kisumu"
heroku config:set DEFAULT_COUNTRY="Kenya"

# Add other environment variables as needed
heroku config:set EMAIL_HOST_USER="your-email@gmail.com"
heroku config:set EMAIL_HOST_PASSWORD="your-app-password"
```

### 4. Deploy
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### 5. Run Migrations
```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
heroku run python manage.py collectstatic --noinput
```

### 6. Test Your API
```bash
curl https://your-youth-green-jobs-api.herokuapp.com/api/v1/
```

## Step 3: Get Your Backend URL
Your backend will be available at:
```
https://your-youth-green-jobs-api.herokuapp.com
```

Save this URL - you'll need it for the frontend deployment!
