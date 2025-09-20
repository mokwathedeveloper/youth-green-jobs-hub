#!/bin/bash

# Youth Green Jobs Hub - Heroku Deployment Script
# This script deploys the application to Heroku

set -e  # Exit on any error

echo "🚀 Youth Green Jobs Hub - Heroku Deployment"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    print_error "Heroku CLI is not installed. Please install it first:"
    echo "curl https://cli-assets.heroku.com/install.sh | sh"
    exit 1
fi

print_status "Heroku CLI is installed"

# Check if logged in to Heroku
if ! heroku auth:whoami &> /dev/null; then
    print_info "Please log in to Heroku:"
    heroku login
fi

print_status "Logged in to Heroku"

# Get app name from user
read -p "Enter your Heroku app name (e.g., youth-green-jobs-api): " APP_NAME

if [ -z "$APP_NAME" ]; then
    print_error "App name is required"
    exit 1
fi

print_info "App name: $APP_NAME"

# Check if app exists, if not create it
if heroku apps:info $APP_NAME &> /dev/null; then
    print_warning "App $APP_NAME already exists"
else
    print_info "Creating Heroku app: $APP_NAME"
    heroku create $APP_NAME
    print_status "App created successfully"
fi

# Add PostgreSQL addon
print_info "Adding PostgreSQL addon..."
if heroku addons:info heroku-postgresql -a $APP_NAME &> /dev/null; then
    print_warning "PostgreSQL addon already exists"
else
    heroku addons:create heroku-postgresql:essential-0 -a $APP_NAME
    print_status "PostgreSQL addon added"
fi

# Enable PostGIS extension
print_info "Enabling PostGIS extension..."
heroku pg:psql -a $APP_NAME -c "CREATE EXTENSION IF NOT EXISTS postgis;"
print_status "PostGIS extension enabled"

# Set environment variables
print_info "Setting environment variables..."

heroku config:set DJANGO_SETTINGS_MODULE=youth_green_jobs_backend.heroku_settings -a $APP_NAME
heroku config:set SECRET_KEY="M@nnV$96)y+E^5eIndW&OYs5Lk50_SdMc29Zd_8Zbn&bb=!Gz7" -a $APP_NAME

# Platform settings
heroku config:set PLATFORM_NAME="Youth Green Jobs Hub" -a $APP_NAME
heroku config:set DEFAULT_COUNTY="Kisumu" -a $APP_NAME
heroku config:set DEFAULT_COUNTRY="Kenya" -a $APP_NAME
heroku config:set SUPPORT_EMAIL="support@youthgreenjobs.ke" -a $APP_NAME

# Email settings (if configured)
EMAIL_USER=$(grep "EMAIL_HOST_USER=" .env | cut -d'=' -f2)
EMAIL_PASS=$(grep "EMAIL_HOST_PASSWORD=" .env | cut -d'=' -f2)

if [ "$EMAIL_USER" != "your-actual-email@gmail.com" ] && [ ! -z "$EMAIL_USER" ]; then
    heroku config:set EMAIL_HOST_USER="$EMAIL_USER" -a $APP_NAME
    heroku config:set EMAIL_HOST_PASSWORD="$EMAIL_PASS" -a $APP_NAME
    print_status "Email configuration set"
else
    print_warning "Email not configured - users won't receive emails"
fi

print_status "Environment variables set"

# Commit any changes
print_info "Preparing code for deployment..."
git add .
if git diff --staged --quiet; then
    print_info "No changes to commit"
else
    git commit -m "Prepare for Heroku deployment - $(date)"
    print_status "Changes committed"
fi

# Deploy to Heroku
print_info "Deploying to Heroku..."
git push heroku main

print_status "Code deployed successfully"

# Run migrations
print_info "Running database migrations..."
heroku run python manage.py migrate -a $APP_NAME

# Create superuser (optional)
print_info "Do you want to create a superuser? (y/n)"
read -p "Create superuser? " CREATE_SUPERUSER

if [ "$CREATE_SUPERUSER" = "y" ] || [ "$CREATE_SUPERUSER" = "Y" ]; then
    heroku run python manage.py createsuperuser -a $APP_NAME
fi

# Collect static files
print_info "Collecting static files..."
heroku run python manage.py collectstatic --noinput -a $APP_NAME

print_status "Static files collected"

# Test the deployment
print_info "Testing deployment..."
APP_URL="https://$APP_NAME.herokuapp.com"

echo ""
print_status "🎉 Deployment completed successfully!"
echo ""
print_info "📋 Your app details:"
echo "  🌐 App URL: $APP_URL"
echo "  🔧 API Root: $APP_URL/api/v1/"
echo "  👨‍💼 Admin Panel: $APP_URL/admin/"
echo ""
print_info "🧪 Testing API endpoint..."

# Test API endpoint
if curl -s "$APP_URL/api/v1/" > /dev/null; then
    print_status "API endpoint is responding"
else
    print_warning "API endpoint test failed - check logs"
fi

echo ""
print_info "📝 Next steps:"
echo "  1. Test your API: curl $APP_URL/api/v1/"
echo "  2. Visit admin panel: $APP_URL/admin/"
echo "  3. Update frontend with backend URL: $APP_URL"
echo "  4. Update CORS settings after frontend deployment"
echo ""
print_info "🔍 Useful commands:"
echo "  heroku logs --tail -a $APP_NAME"
echo "  heroku config -a $APP_NAME"
echo "  heroku run python manage.py shell -a $APP_NAME"
echo ""
print_status "🌱 Your Youth Green Jobs Hub backend is live!"
