# 🚀 Production Setup Guide - Youth Green Jobs Hub

## 📋 Overview

This guide will help you set up the Youth Green Jobs Hub application for production using PostgreSQL with PostGIS for spatial data support.

## ✅ Prerequisites Completed

- ✅ PostgreSQL 16 installed
- ✅ PostGIS extension installed
- ✅ Database `youth_green_jobs_db` created
- ✅ Database user `youth_green_jobs_user` created
- ✅ PostGIS extension enabled on database
- ✅ Python PostgreSQL adapter (psycopg2-binary) installed

## 🗄️ Database Configuration

### Current Setup
```bash
Database: youth_green_jobs_db
User: youth_green_jobs_user
Host: localhost
Port: 5432
Extensions: PostGIS (for spatial data)
```

### Database URL Format
```
postgresql://username:password@host:port/database_name
```

### Your Database URL
```
DATABASE_URL=postgresql://youth_green_jobs_user:your_password@localhost:5432/youth_green_jobs_db
```

## 🔧 Environment Configuration

### Step 1: Copy Production Environment File
```bash
cp .env.production .env
```

### Step 2: Update Critical Settings

Edit `.env` and update these essential values:

#### 🔐 Security Settings
```bash
# Generate a new secret key (CRITICAL!)
SECRET_KEY=your-production-secret-key-here-change-this-to-a-secure-random-string

# Update allowed hosts for your domain
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your-server-ip

# Set debug to false for production
DEBUG=False
```

#### 🗄️ Database Settings
```bash
# Update with your actual password
DATABASE_URL=postgresql://youth_green_jobs_user:your_actual_password@localhost:5432/youth_green_jobs_db
```

#### 🌐 CORS Settings
```bash
# Update with your actual domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🔑 Generate Secure Secret Key

Run this command to generate a secure Django secret key:

```python
python -c "
import secrets
import string
alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
secret_key = ''.join(secrets.choice(alphabet) for i in range(50))
print(f'SECRET_KEY={secret_key}')
"
```

## 🚀 Production Deployment Steps

### Step 1: Update Environment
```bash
# Copy and edit production environment
cp .env.production .env
nano .env  # Update all the values mentioned above
```

### Step 2: Install Production Dependencies
```bash
# Activate virtual environment
source venv/bin/activate

# Install production dependencies
pip install gunicorn whitenoise
```

### Step 3: Update Django Settings for Production
The application is already configured to read from environment variables, so no code changes needed.

### Step 4: Run Database Migrations
```bash
source venv/bin/activate
python manage.py migrate
```

### Step 5: Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### Step 6: Create Superuser
```bash
python manage.py createsuperuser
```

### Step 7: Test Production Configuration
```bash
# Test with production settings
python manage.py check --deploy
```

## 🌐 Web Server Configuration

### Option 1: Gunicorn + Nginx (Recommended)

#### Install Gunicorn
```bash
source venv/bin/activate
pip install gunicorn
```

#### Create Gunicorn Service
```bash
sudo nano /etc/systemd/system/youth-green-jobs.service
```

Add this content:
```ini
[Unit]
Description=Youth Green Jobs Hub
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/path/to/youth-green-jobs-hub
Environment="PATH=/path/to/youth-green-jobs-hub/venv/bin"
EnvironmentFile=/path/to/youth-green-jobs-hub/.env
ExecStart=/path/to/youth-green-jobs-hub/venv/bin/gunicorn --workers 3 --bind unix:/path/to/youth-green-jobs-hub/youth_green_jobs_backend.sock youth_green_jobs_backend.wsgi:application

[Install]
WantedBy=multi-user.target
```

#### Start and Enable Service
```bash
sudo systemctl start youth-green-jobs
sudo systemctl enable youth-green-jobs
```

### Option 2: Simple Gunicorn (for testing)
```bash
source venv/bin/activate
gunicorn --bind 0.0.0.0:8000 youth_green_jobs_backend.wsgi:application
```

## 🔒 Security Checklist

- [ ] SECRET_KEY changed to a secure random string
- [ ] DEBUG=False in production
- [ ] ALLOWED_HOSTS configured with your domain
- [ ] HTTPS enabled (SECURE_SSL_REDIRECT=True)
- [ ] Database password is strong and secure
- [ ] CORS origins limited to your domain
- [ ] File permissions set correctly
- [ ] Firewall configured to allow only necessary ports

## 📊 Database Management

### Backup Database
```bash
sudo -u postgres pg_dump youth_green_jobs_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
sudo -u postgres psql youth_green_jobs_db < backup_file.sql
```

### Monitor Database
```bash
# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('youth_green_jobs_db'));"

# Check active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity WHERE datname='youth_green_jobs_db';"
```

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check if database exists
   sudo -u postgres psql -l | grep youth_green_jobs_db
   ```

2. **Permission Denied**
   ```bash
   # Fix file permissions
   sudo chown -R www-data:www-data /path/to/youth-green-jobs-hub
   sudo chmod -R 755 /path/to/youth-green-jobs-hub
   ```

3. **Static Files Not Loading**
   ```bash
   # Collect static files again
   python manage.py collectstatic --clear --noinput
   ```

## 📈 Performance Optimization

### Database Optimization
```sql
-- Connect to database
sudo -u postgres psql youth_green_jobs_db

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_waste_reports_created_at ON waste_collection_wastereport(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products_product(category_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON authentication_user(email);
```

### Caching (Optional)
```bash
# Install Redis for caching
sudo apt install redis-server
pip install django-redis
```

## 🎯 Next Steps

1. Set up domain and SSL certificate
2. Configure Nginx as reverse proxy
3. Set up monitoring (Sentry, logs)
4. Configure automated backups
5. Set up CI/CD pipeline
6. Configure email service
7. Set up payment gateways (M-Pesa, Paystack)

## 📞 Support

If you encounter any issues:
1. Check the logs: `tail -f /var/log/youth-green-jobs/app.log`
2. Check Django logs: `python manage.py check`
3. Verify database connection: `python manage.py dbshell`

---

**🌱 Your Youth Green Jobs Hub is ready for production!**
