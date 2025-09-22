#!/bin/bash

# Youth Green Jobs Hub - Production Deployment Script
# This script sets up the application for production with PostgreSQL

set -e  # Exit on any error

echo "🌱 Youth Green Jobs Hub - Production Deployment"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    print_error "Virtual environment not found. Please run setup first."
    exit 1
fi

print_info "Starting production deployment..."

# 1. Activate virtual environment
print_info "Activating virtual environment..."
source venv/bin/activate

# 2. Install production dependencies
print_info "Installing production dependencies..."
pip install gunicorn whitenoise

# 3. Copy production environment file
if [ ! -f ".env" ]; then
    print_info "Copying production environment configuration..."
    cp .env.production .env
    print_warning "Please update .env with your production values before continuing!"
    print_info "Key settings to update:"
    echo "  - SECRET_KEY (already generated)"
    echo "  - ALLOWED_HOSTS (your domain)"
    echo "  - EMAIL_HOST_USER and EMAIL_HOST_PASSWORD"
    echo "  - Payment gateway credentials (M-Pesa, Paystack)"
    echo "  - Google Maps API keys"
    read -p "Press Enter when you've updated .env file..."
fi

# 4. Run database migrations
print_info "Running database migrations..."
python manage.py migrate

# 5. Collect static files
print_info "Collecting static files..."
python manage.py collectstatic --noinput

# 6. Create superuser if it doesn't exist
print_info "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. Please create one.')
    exit(1)
else:
    print('Superuser already exists.')
"

if [ $? -eq 1 ]; then
    print_info "Creating superuser..."
    python manage.py createsuperuser
fi

# 7. Run security check
print_info "Running Django security check..."
python manage.py check --deploy

# 8. Test database connection
print_info "Testing database connection..."
python test_postgresql.py

# 9. Create systemd service file
print_info "Creating systemd service file..."
SERVICE_FILE="/tmp/youth-green-jobs.service"
CURRENT_DIR=$(pwd)
USER=$(whoami)

cat > $SERVICE_FILE << EOF
[Unit]
Description=Youth Green Jobs Hub
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=$CURRENT_DIR
Environment="PATH=$CURRENT_DIR/venv/bin"
EnvironmentFile=$CURRENT_DIR/.env
ExecStart=$CURRENT_DIR/venv/bin/gunicorn --workers 3 --bind unix:$CURRENT_DIR/youth_green_jobs_backend.sock youth_green_jobs_backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

print_info "Systemd service file created at $SERVICE_FILE"
print_warning "To install the service, run:"
echo "  sudo cp $SERVICE_FILE /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable youth-green-jobs"
echo "  sudo systemctl start youth-green-jobs"

# 10. Create nginx configuration
print_info "Creating Nginx configuration..."
NGINX_CONFIG="/tmp/youth-green-jobs-nginx.conf"

cat > $NGINX_CONFIG << EOF
server {
    listen 80;
    server_name youthgreenjobs.ke www.youthgreenjobs.ke;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root $CURRENT_DIR;
    }

    location /media/ {
        root $CURRENT_DIR;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:$CURRENT_DIR/youth_green_jobs_backend.sock;
    }
}
EOF

print_info "Nginx configuration created at $NGINX_CONFIG"
print_warning "To install nginx configuration, run:"
echo "  sudo cp $NGINX_CONFIG /etc/nginx/sites-available/youth-green-jobs"
echo "  sudo ln -s /etc/nginx/sites-available/youth-green-jobs /etc/nginx/sites-enabled/"
echo "  sudo nginx -t"
echo "  sudo systemctl restart nginx"

# 11. Create backup script
print_info "Creating backup script..."
BACKUP_SCRIPT="backup_database.sh"

cat > $BACKUP_SCRIPT << EOF
#!/bin/bash
# Database backup script for Youth Green Jobs Hub

BACKUP_DIR="\$HOME/backups/youth-green-jobs"
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="\$BACKUP_DIR/youth_green_jobs_db_\$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p \$BACKUP_DIR

# Create database backup
sudo -u postgres pg_dump youth_green_jobs_db > \$BACKUP_FILE

# Compress the backup
gzip \$BACKUP_FILE

echo "Database backup created: \$BACKUP_FILE.gz"

# Remove backups older than 30 days
find \$BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
EOF

chmod +x $BACKUP_SCRIPT
print_status "Backup script created: $BACKUP_SCRIPT"

# 12. Create SSL certificate setup instructions
print_info "Creating SSL certificate setup instructions..."
SSL_INSTRUCTIONS="ssl_setup.md"

cat > $SSL_INSTRUCTIONS << EOF
# SSL Certificate Setup

## Using Let's Encrypt (Recommended)

1. Install Certbot:
   \`\`\`bash
   sudo apt install certbot python3-certbot-nginx
   \`\`\`

2. Obtain SSL certificate:
   \`\`\`bash
   sudo certbot --nginx -d youthgreenjobs.ke -d www.youthgreenjobs.ke
   \`\`\`

3. Test automatic renewal:
   \`\`\`bash
   sudo certbot renew --dry-run
   \`\`\`

## Manual Certificate

If you have your own SSL certificate:

1. Copy certificate files to /etc/ssl/certs/
2. Update nginx configuration to include SSL settings
3. Restart nginx

## Security Headers

Add these to your nginx configuration for better security:
\`\`\`nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
\`\`\`
EOF

print_status "SSL setup instructions created: $SSL_INSTRUCTIONS"

# 13. Final summary
echo ""
print_status "🎉 Production deployment preparation complete!"
echo ""
print_info "📋 Summary of what was done:"
echo "  ✅ Virtual environment activated"
echo "  ✅ Production dependencies installed (gunicorn, whitenoise)"
echo "  ✅ Database migrations applied"
echo "  ✅ Static files collected"
echo "  ✅ Security check passed"
echo "  ✅ Database connection tested"
echo "  ✅ Systemd service file created"
echo "  ✅ Nginx configuration created"
echo "  ✅ Backup script created"
echo "  ✅ SSL setup instructions created"
echo ""
print_warning "🔧 Next steps to complete deployment:"
echo "  1. Update .env with your production values"
echo "  2. Install and configure systemd service"
echo "  3. Install and configure Nginx"
echo "  4. Set up SSL certificate"
echo "  5. Configure firewall (UFW)"
echo "  6. Set up monitoring and logging"
echo ""
print_info "📚 Files created:"
echo "  - /tmp/youth-green-jobs.service (systemd service)"
echo "  - /tmp/youth-green-jobs-nginx.conf (nginx config)"
echo "  - backup_database.sh (backup script)"
echo "  - ssl_setup.md (SSL instructions)"
echo ""
print_status "🌱 Your Youth Green Jobs Hub is ready for production!"
EOF
