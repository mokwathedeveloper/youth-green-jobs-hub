# 🚀 Deployment Guide - Youth Green Jobs Hub

## 📋 Deployment Overview

This guide covers deploying the Youth Green Jobs & Waste Recycling Hub to production environments using modern cloud platforms.

**Recommended Stack:**
- **Backend**: Heroku (Django + PostgreSQL)
- **Frontend**: Vercel (React TypeScript)
- **Database**: Heroku PostgreSQL with PostGIS
- **File Storage**: AWS S3 or Cloudinary
- **Monitoring**: Heroku metrics + Sentry

## 🔧 Prerequisites

### Required Accounts & Services
- [Heroku Account](https://heroku.com) - Backend hosting
- [Vercel Account](https://vercel.com) - Frontend hosting  
- [GitHub Account](https://github.com) - Code repository
- [AWS Account](https://aws.amazon.com) - File storage (optional)
- [Sentry Account](https://sentry.io) - Error monitoring (optional)

### Required Tools
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Install Vercel CLI
npm i -g vercel

# Install Git (if not already installed)
# Windows: https://git-scm.com/download/win
# macOS: brew install git
# Linux: sudo apt-get install git
```

## 🗄️ Database Setup (Heroku PostgreSQL)

### 1. Create Heroku App
```bash
# Login to Heroku
heroku login

# Create new app
heroku create youth-green-jobs-api

# Add PostgreSQL addon with PostGIS
heroku addons:create heroku-postgresql:mini
heroku pg:psql -c "CREATE EXTENSION postgis;"
```

### 2. Configure Database
```bash
# Get database URL
heroku config:get DATABASE_URL

# Example output:
# postgres://username:password@hostname:5432/database_name
```

## 🔙 Backend Deployment (Heroku)

### 1. Prepare Django for Production

Create `Procfile` in project root:
```
web: gunicorn youth_green_jobs_backend.wsgi:application
release: python manage.py migrate
```

Create `runtime.txt`:
```
python-3.11.7
```

Update `requirements.txt`:
```txt
# Add production dependencies
dj-database-url==2.1.0
gunicorn==21.2.0
whitenoise==6.6.0
psycopg2-binary==2.9.10
```

### 2. Configure Production Settings

Create `youth_green_jobs_backend/production_settings.py`:
```python
from .settings import *
import dj_database_url

# Production-specific settings
DEBUG = False
ALLOWED_HOSTS = ['youth-green-jobs-api.herokuapp.com', 'youthgreenjobs.ke']

# Database
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
}

# Static files
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Security
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# CORS for production frontend
CORS_ALLOWED_ORIGINS = [
    'https://youth-green-jobs.vercel.app',
    'https://youthgreenjobs.ke',
]
```

### 3. Set Environment Variables
```bash
# Required environment variables
heroku config:set DJANGO_SETTINGS_MODULE=youth_green_jobs_backend.production_settings
heroku config:set SECRET_KEY="your-super-secret-key-here"
heroku config:set DEBUG=False

# Optional configurations
heroku config:set ALLOWED_HOSTS="youth-green-jobs-api.herokuapp.com,youthgreenjobs.ke"
heroku config:set CORS_ALLOWED_ORIGINS="https://youth-green-jobs.vercel.app,https://youthgreenjobs.ke"

# JWT Configuration
heroku config:set JWT_ACCESS_TOKEN_LIFETIME_MINUTES=60
heroku config:set JWT_REFRESH_TOKEN_LIFETIME_DAYS=7

# File upload settings
heroku config:set MAX_UPLOAD_SIZE_MB=10

# Email settings (optional)
heroku config:set EMAIL_HOST="smtp.gmail.com"
heroku config:set EMAIL_HOST_USER="your-email@gmail.com"
heroku config:set EMAIL_HOST_PASSWORD="your-app-password"

# Payment settings (for M-Pesa/Paystack)
heroku config:set MPESA_CONSUMER_KEY="your-mpesa-key"
heroku config:set MPESA_CONSUMER_SECRET="your-mpesa-secret"
heroku config:set PAYSTACK_PUBLIC_KEY="your-paystack-public-key"
heroku config:set PAYSTACK_SECRET_KEY="your-paystack-secret-key"
```

### 4. Deploy to Heroku
```bash
# Add Heroku remote
heroku git:remote -a youth-green-jobs-api

# Deploy
git add .
git commit -m "Configure for Heroku deployment"
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser

# Collect static files
heroku run python manage.py collectstatic --noinput
```

### 5. Verify Backend Deployment
```bash
# Check app status
heroku ps

# View logs
heroku logs --tail

# Test API endpoint
curl https://youth-green-jobs-api.herokuapp.com/api/v1/
```

## 🎨 Frontend Deployment (Vercel)

### 1. Prepare React App for Production

Update `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://youth-green-jobs-api.herokuapp.com/api/v1
VITE_APP_NAME=Youth Green Jobs Hub
VITE_APP_VERSION=1.0.0
```

Update `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-slot', 'lucide-react'],
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_API_BASE_URL production
# Enter: https://youth-green-jobs-api.herokuapp.com/api/v1
```

#### Option B: GitHub Integration
1. Push code to GitHub repository
2. Connect repository to Vercel dashboard
3. Configure build settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add environment variables in Vercel dashboard

### 3. Configure Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add youthgreenjobs.ke

# Configure DNS records:
# Type: CNAME
# Name: @
# Value: cname.vercel-dns.com
```

## 🔒 Security Configuration

### SSL/HTTPS Setup
Both Heroku and Vercel provide automatic HTTPS certificates.

### Environment Security
```bash
# Rotate secret keys regularly
heroku config:set SECRET_KEY="new-secret-key"

# Use strong JWT secrets
heroku config:set JWT_SIGNING_KEY="complex-jwt-secret"

# Enable security headers
heroku config:set SECURE_HSTS_SECONDS=31536000
heroku config:set SECURE_HSTS_INCLUDE_SUBDOMAINS=True
```

### Database Security
```bash
# Enable connection pooling
heroku addons:create heroku-postgresql:standard-0

# Configure backup schedule
heroku pg:backups:schedule DATABASE_URL --at "02:00 Africa/Nairobi"
```

## 📊 Monitoring & Logging

### Heroku Monitoring
```bash
# Enable log drains
heroku drains:add https://logs.example.com/heroku

# Monitor app metrics
heroku addons:create librato:development

# Set up alerts
heroku addons:create papertrail:choklad
```

### Error Tracking with Sentry
```bash
# Install Sentry
pip install sentry-sdk[django]

# Configure in settings
heroku config:set SENTRY_DSN="your-sentry-dsn"
```

Add to Django settings:
```python
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn=os.environ.get('SENTRY_DSN'),
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
    send_default_pii=True
)
```

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
      - name: Run tests
        run: |
          python manage.py test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "youth-green-jobs-api"
          heroku_email: "your-email@example.com"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./frontend
```

## 🧪 Testing Deployment

### Backend Testing
```bash
# Test API endpoints
curl https://youth-green-jobs-api.herokuapp.com/api/v1/
curl https://youth-green-jobs-api.herokuapp.com/api/v1/auth/register/

# Test database connection
heroku run python manage.py dbshell
```

### Frontend Testing
```bash
# Test frontend
curl https://youth-green-jobs.vercel.app/

# Test API integration
# Open browser developer tools and check network requests
```

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API performance
ab -n 100 -c 10 https://youth-green-jobs-api.herokuapp.com/api/v1/
```

## 🔧 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Check Heroku logs
heroku logs --tail

# Database connection issues
heroku pg:info
heroku run python manage.py dbshell

# Static files not loading
heroku run python manage.py collectstatic --noinput
```

#### Frontend Issues
```bash
# Check Vercel deployment logs
vercel logs

# Build failures
npm run build
npm run preview

# Environment variable issues
vercel env ls
```

### Performance Optimization
```bash
# Enable Heroku Redis for caching
heroku addons:create heroku-redis:mini

# Configure CDN for static assets
heroku addons:create cloudinary:free
```

## 📈 Scaling Considerations

### Backend Scaling
```bash
# Scale dynos
heroku ps:scale web=2

# Upgrade database
heroku addons:upgrade heroku-postgresql:standard-0

# Add worker dynos for background tasks
heroku ps:scale worker=1
```

### Frontend Scaling
- Vercel automatically handles scaling
- Consider implementing CDN for images
- Enable edge caching for API responses

---

**Deployment Status**: ✅ Production Ready  
**Estimated Deployment Time**: 2-3 hours  
**Monthly Cost**: ~$25-50 (Heroku Hobby + Vercel Pro)  
**Support**: 24/7 platform support available
