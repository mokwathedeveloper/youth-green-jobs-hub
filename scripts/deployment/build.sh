#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Starting Youth Green Jobs Hub Build Process"

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Create PostGIS extension if it doesn't exist
echo "🗄️ Setting up PostGIS extension..."
python manage.py shell -c "
from django.db import connection
with connection.cursor() as cursor:
    try:
        cursor.execute('CREATE EXTENSION IF NOT EXISTS postgis;')
        print('✅ PostGIS extension created successfully')
    except Exception as e:
        print(f'⚠️ PostGIS extension error (might already exist): {e}')
"

# Run migrations
echo "🔄 Running database migrations..."
echo "📋 Checking migration status..."
python manage.py showmigrations

echo "🔄 Running migrations with verbose output..."
python manage.py migrate --verbosity=2

echo "✅ Migration status after running migrations:"
python manage.py showmigrations

# Create superuser if it doesn't exist
echo "👨‍💼 Creating superuser account..."
python manage.py shell -c "
from authentication.models import User
import os
if not User.objects.filter(username='admin').exists():
    try:
        User.objects.create_superuser(
            username='admin',
            email='moffatmokwa12@gmail.com',
            password='YouthGreenJobs2024!',
            first_name='Admin',
            last_name='User',
            phone_number='+254700000000',
            county='Nairobi',
            user_type='youth'
        )
        print('✅ Superuser created successfully')
    except Exception as e:
        print(f'⚠️ Superuser creation error: {e}')
else:
    print('✅ Superuser already exists')
"

# Create staticfiles directory if it doesn't exist
echo "📁 Preparing static files directory..."
mkdir -p staticfiles

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input --clear

# Verify database setup
echo "🧪 Verifying database setup..."
python manage.py shell -c "
from authentication.models import User
print(f'✅ Database working - Users in database: {User.objects.count()}')
"

echo "🎉 Build completed successfully!"
